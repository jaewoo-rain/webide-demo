from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreateRequest(BaseModel):
    username: str
    # email: EmailStr
    password: str


class UserReadResponse(BaseModel):
    id: int
    username: str
    # email: EmailStr

    model_config = ConfigDict(from_attributes=True)