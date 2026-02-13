from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class AddressIn(BaseModel):
    label: str
    line1: str
    city: str
    is_default: bool = False


class AddressOut(AddressIn):
    id: int
    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: int
    email: str
    name: str
    phone: str
    role: str
    addresses: list[AddressOut]
    model_config = ConfigDict(from_attributes=True)


class MeUpdate(BaseModel):
    name: str
    phone: str
    addresses: list[AddressIn] = []


class CategoryIn(BaseModel):
    name: str


class CategoryOut(CategoryIn):
    id: int
    model_config = ConfigDict(from_attributes=True)


class MenuItemIn(BaseModel):
    category_id: int
    name: str
    description: str
    price: float
    image_url: str = ""


class MenuItemOut(MenuItemIn):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class FavoriteOut(BaseModel):
    menu_item_id: int


class OrderItemIn(BaseModel):
    menu_item_id: int
    quantity: int
    selected_options: str = ""


class OrderCreate(BaseModel):
    address_id: int | None = None
    mode: str
    note: str = ""
    items: list[OrderItemIn]


class OrderItemOut(BaseModel):
    menu_item_id: int
    quantity: int
    unit_price: float
    selected_options: str
    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    user_id: int
    address_id: int | None
    mode: str
    note: str
    subtotal: float
    delivery_fee: float
    tax: float
    total: float
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str
