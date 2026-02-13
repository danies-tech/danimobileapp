from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, hash_password, require_admin, verify_password
from app.database import Base, SessionLocal, engine, get_db
from app.models import Address, Category, Favorite, MenuItem, MenuItemOption, Order, OrderItem, OrderStatusHistory, User
from app.schemas import (
    CategoryIn,
    CategoryOut,
    LoginRequest,
    MeUpdate,
    MenuItemIn,
    MenuItemOut,
    OrderCreate,
    OrderOut,
    OrderStatusUpdate,
    RegisterRequest,
    TokenResponse,
    UserProfile,
)
from app.seed import seed_data

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_data(db)

app = FastAPI(title="Restaurant MVP API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, password_hash=hash_password(payload.password), name=payload.name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}) )


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}))


@app.get("/me", response_model=UserProfile)
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.addresses
    return user


@app.put("/me", response_model=UserProfile)
def update_me(payload: MeUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.name = payload.name
    user.phone = payload.phone
    db.query(Address).filter(Address.user_id == user.id).delete()
    for addr in payload.addresses:
        db.add(Address(user_id=user.id, **addr.model_dump()))
    db.commit()
    db.refresh(user)
    return user


@app.get("/categories", response_model=list[CategoryOut])
def categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@app.get("/menu-items", response_model=list[MenuItemOut])
def menu_items(
    categoryId: int | None = Query(default=None),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(MenuItem).filter(MenuItem.is_active == True)
    if categoryId:
        query = query.filter(MenuItem.category_id == categoryId)
    if q:
        query = query.filter(MenuItem.name.ilike(f"%{q}%"))
    return query.all()


@app.get("/menu-items/{item_id}")
def menu_item_details(item_id: int, db: Session = Depends(get_db)):
    item = db.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    options = db.query(MenuItemOption).filter(MenuItemOption.menu_item_id == item_id).all()
    return {"item": MenuItemOut.model_validate(item), "options": options}


@app.post("/favorites/{menu_item_id}")
def add_favorite(menu_item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exists = db.query(Favorite).filter(Favorite.user_id == user.id, Favorite.menu_item_id == menu_item_id).first()
    if not exists:
        db.add(Favorite(user_id=user.id, menu_item_id=menu_item_id))
        db.commit()
    return {"ok": True}


@app.delete("/favorites/{menu_item_id}")
def remove_favorite(menu_item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Favorite).filter(Favorite.user_id == user.id, Favorite.menu_item_id == menu_item_id).delete()
    db.commit()
    return {"ok": True}


@app.get("/favorites")
def list_favorites(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    favs = db.query(Favorite).filter(Favorite.user_id == user.id).all()
    return [f.menu_item_id for f in favs]


@app.post("/orders", response_model=OrderOut)
def create_order(payload: OrderCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subtotal = 0.0
    for line in payload.items:
        item = db.get(MenuItem, line.menu_item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Menu item not found")
        subtotal += item.price * line.quantity

    delivery_fee = 3.5 if payload.mode == "delivery" else 0
    tax = round(subtotal * 0.08, 2)
    total = subtotal + delivery_fee + tax

    order = Order(
        user_id=user.id,
        address_id=payload.address_id,
        mode=payload.mode,
        note=payload.note,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        tax=tax,
        total=total,
        status="Placed",
    )
    db.add(order)
    db.flush()
    for line in payload.items:
        item = db.get(MenuItem, line.menu_item_id)
        db.add(OrderItem(order_id=order.id, menu_item_id=line.menu_item_id, quantity=line.quantity, unit_price=item.price, selected_options=line.selected_options))
    db.add(OrderStatusHistory(order_id=order.id, status="Placed"))
    db.commit()
    db.refresh(order)
    return order


@app.get("/orders", response_model=list[OrderOut])
def my_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "admin":
        return db.query(Order).order_by(Order.created_at.desc()).all()
    return db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()


@app.get("/orders/{order_id}")
def order_details(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Not found")
    if user.role != "admin" and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    history = db.query(OrderStatusHistory).filter(OrderStatusHistory.order_id == order.id).all()
    return {"order": OrderOut.model_validate(order), "items": items, "history": history, "eta": "25-35 min"}


@app.patch("/orders/{order_id}/status")
def update_order_status(order_id: int, payload: OrderStatusUpdate, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Not found")
    order.status = payload.status
    db.add(OrderStatusHistory(order_id=order.id, status=payload.status))
    db.commit()
    return {"ok": True}


@app.get("/admin/analytics")
def analytics(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    today_orders = db.query(func.count(Order.id)).scalar() or 0
    revenue = db.query(func.sum(Order.total)).scalar() or 0
    return {"total_orders_today": today_orders, "revenue_today": revenue}


@app.post("/admin/categories", response_model=CategoryOut)
def create_category(payload: CategoryIn, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    category = Category(name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@app.put("/admin/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, payload: CategoryIn, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Not found")
    category.name = payload.name
    db.commit()
    return category


@app.delete("/admin/categories/{category_id}")
def delete_category(category_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    db.query(Category).filter(Category.id == category_id).delete()
    db.commit()
    return {"ok": True}


@app.get("/admin/categories", response_model=list[CategoryOut])
def admin_categories(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(Category).all()


@app.post("/admin/menu-items", response_model=MenuItemOut)
def create_menu_item(payload: MenuItemIn, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    item = MenuItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/admin/menu-items/{item_id}", response_model=MenuItemOut)
def update_menu_item(item_id: int, payload: MenuItemIn, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    item = db.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    return item


@app.delete("/admin/menu-items/{item_id}")
def delete_menu_item(item_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    db.query(MenuItem).filter(MenuItem.id == item_id).delete()
    db.commit()
    return {"ok": True}


@app.get("/admin/menu-items", response_model=list[MenuItemOut])
def admin_menu_items(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(MenuItem).all()


@app.post("/auth/forgot-password")
def forgot_password(email: str):
    return {"message": f"Reset link sent to {email} (mock)"}
