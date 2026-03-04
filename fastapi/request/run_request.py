from pydantic import BaseModel

class RunRequest(BaseModel):
    code: str
    username:str
    project_name: str
    # vnc_url: str
    # ws_url: str







