from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from repository.db import get_db
from repository.models.user import User
from dto.user import UserCreateRequest, UserReadResponse, LoginRequest, LoginResponse
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from core.auth import get_current_user
from fastapi import Response

from repository import userRepository as user_crud
from repository import projectRepository as project_crud
from utils.util_create_project import (slug)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserReadResponse, status_code=status.HTTP_201_CREATED)
def signup(user_create: UserCreateRequest, db: Session = Depends(get_db)):

    # 기존 유저 확인
    existing_username = user_crud.get_by_username(db, user_create.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="이미 존재하는 username입니다.")

    # 유저 만들기
    user = user_crud.create_user(db, {
        "username": user_create.username,
        "hashed_password": hash_password(user_create.password),
    })

    db.commit()
    return user

@router.post("/login")
def login(
    req: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    # 유저 존재하는지 확인
    user = user_crud.get_by_username(db, req.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="username 또는 password가 올바르지 않습니다.",
        )

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="username 또는 password가 올바르지 않습니다.",
        )

    # accessToken 만들기
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=60),
    )

    # 쿠키에 넣어서 전송
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False, # https 사용시 True
        samesite="lax",
        max_age=3600,
        path="/",
    )

    # 기존 프로젝트 목록
    owner = slug(req.username)
    projectList = project_crud.list_by_owner(db, owner)

    return {
        "project": projectList
    }

@router.get("/readTest")
def read_protected_data(current_user: User = Depends(get_current_user)):
    return {
        "message": "JWT 검증 통과",
        "user_id": current_user.id,
        "username": current_user.username,
    }