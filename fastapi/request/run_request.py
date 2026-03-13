from pydantic import BaseModel

class RunRequest(BaseModel):
    code: str
    projectKey:str
    # vnc_url: str
    # ws_url: str







