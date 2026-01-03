from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws/terminal")
async def ws_terminal(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("✅ FastAPI WS connected (echo mode)\r\n")

    try:
        while True:
            data = await websocket.receive_text()
            # 입력 받은 걸 그대로 돌려줌
            await websocket.send_text(f"echo: {data}\r\n")
    except WebSocketDisconnect:
        pass