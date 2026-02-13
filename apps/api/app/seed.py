from sqlalchemy.orm import Session

from .auth import hash_password
from .models import Category, MenuItem, MenuItemOption, User


def seed_data(db: Session):
    if db.query(Category).count() > 0:
        return

    categories = [Category(name="Starters"), Category(name="Mains"), Category(name="Drinks")]
    db.add_all(categories)
    db.flush()

    items = [
        MenuItem(category_id=categories[0].id, name="Truffle Fries", description="Crispy fries with truffle aioli.", price=7.5, image_url="/uploads/fries.jpg"),
        MenuItem(category_id=categories[1].id, name="Grilled Salmon", description="Lemon butter salmon with greens.", price=18.0, image_url="/uploads/salmon.jpg"),
        MenuItem(category_id=categories[2].id, name="Berry Fizz", description="Sparkling berry mocktail.", price=5.5, image_url="/uploads/berry.jpg"),
    ]
    db.add_all(items)
    db.flush()

    db.add_all([
        MenuItemOption(menu_item_id=items[1].id, name="Extra Sauce", price_delta=1.5),
        MenuItemOption(menu_item_id=items[1].id, name="Large Portion", price_delta=4.0),
    ])

    admin = User(
        email="admin@restaurant.app",
        password_hash=hash_password("admin1234"),
        name="Admin",
        phone="0000000000",
        role="admin",
    )
    demo_user = User(
        email="demo@restaurant.app",
        password_hash=hash_password("demo1234"),
        name="Demo User",
        phone="1234567890",
        role="customer",
    )
    db.add_all([admin, demo_user])
    db.commit()
