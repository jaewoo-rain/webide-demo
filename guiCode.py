# http://210.117.181.56:30681/vnc.html 확인 가능
import turtle as t
import random

t.setup(900, 700)
t.title("Turtle Demo")
t.bgcolor("black")
t.speed(0)
t.hideturtle()
t.colormode(255)

# 1) 별 그리기 함수
def star(x, y, size, color):
    t.penup()
    t.goto(x, y)
    t.pendown()
    t.color(color)
    t.begin_fill()
    for _ in range(5):
        t.forward(size)
        t.right(144)
    t.end_fill()

# 2) 무지개 원 그리기
def rainbow_circle(radius, count):
    for i in range(count):
        r = int(255 * i / count)
        g = int(255 * (count - i) / count)
        b = random.randint(100, 255)
        t.pencolor(r, g, b)
        t.penup()
        t.goto(0, -radius - i * 2)
        t.pendown()
        t.circle(radius + i * 2)

# 별 여러 개 찍기
for _ in range(30):
    x = random.randint(-420, 420)
    y = random.randint(-300, 300)
    size = random.randint(10, 40)
    color = (255, 255, random.randint(0, 255))
    star(x, y, size, color)

# 무지개 원
t.pensize(3)
rainbow_circle(60, 40)

# 텍스트
t.penup()
t.goto(0, 180)
t.color("white")
t.write("HELLO TURTLE!", align="center", font=("Arial", 28, "bold"))

t.done()
