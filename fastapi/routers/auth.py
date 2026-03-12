from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from dto.user import UserCreateRequest, UserReadResponse
from dto.auth import Token
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from core.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserReadResponse, status_code=status.HTTP_201_CREATED)
def signup(user_create: UserCreateRequest, db: Session = Depends(get_db)):
    existing_username = (
        db.query(User).filter(User.username == user_create.username).first()
    )
    if existing_username:
        raise HTTPException(status_code=400, detail="이미 존재하는 username입니다.")

    existing_email = (
        db.query(User).filter(User.email == user_create.email).first()
    )
    if existing_email:
        raise HTTPException(status_code=400, detail="이미 존재하는 email입니다.")

    user = User(
        username=user_create.username,
        email=user_create.email,
        hashed_password=hash_password(user_create.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="username 또는 password가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="username 또는 password가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=60),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/readTest")
def read_protected_data(current_user: User = Depends(get_current_user)):
    return {
        "message": "JWT 검증 통과",
        "user_id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }