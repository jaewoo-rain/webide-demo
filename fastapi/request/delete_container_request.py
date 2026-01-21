from pydantic import BaseModel
from typing import Dict, List, Optional


class DeleteContainerRequest(BaseModel):
    user_name:str
    project_name:str