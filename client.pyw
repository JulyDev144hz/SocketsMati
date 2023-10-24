# se importa tkinter para la interfaz visiual y los sockets y los hilos
from tkinter import *
from socket import *
import threading

# se define las jugadas de victoria del tateti
wins=[
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,4,8],
    [2,4,6],
    [0,3,6],
    [1,4,7],
    [2,5,8],
]

MAXJUGADAS = 3
jugadas = 0
movePos = 50

def checkRows(player): # esta funcion sirve para comprobar por cada jugada victoriosa de wins si el jugador del parametro gano
    global wins
    result = False
    for win in wins:
        casilla1 = casillas[win[0]].cget('text')
        casilla2 = casillas[win[1]].cget('text')
        casilla3 = casillas[win[2]].cget('text')
        if casilla1 == player and casilla2 == player and casilla3 == player:
            result = True
            break
    return result

def ganar(p): # funcion para mensaje de victoria
    switchState(DISABLED)
    titulo["text"] = f"Gano {p}"

def checkWinner(): # checkea si X o O ganaron
    for p in ['X', 'O']:
        if checkRows(p):
            ganar(p)
    pass

def dibujar(p, pos): # se dibuja la casilla clickeada, se cambia de turno y se verifica si algun jugador gano
    casillas[int(pos)].config(text=p)
    switch()
    checkWinner()

def switch(): # esta funcion sirve para cambiar de turno de cada jugador, y tambien cambiar el mensaje que indica de quien es el turno
    global turn
    turn = not turn
    if(turn):
        titulo["text"] = f"{player}, Tu turno"
        switchState(NORMAL) # se activan las casillas
    else:
        titulo["text"] = f"{player}, Espera..."
        switchState(DISABLED) # se desactivan las casillas

def switchState(state): # esta funcion sirve para cambiar el estado de las casillas del tateti a uno pasado por parametro
    for casilla in casillas:
        casilla['state']= state
    pass

def deselect():
    for casilla in casillas:
        casilla.config(bg="#fff")

def removeLast():
    for casilla in casillas:
        if(casilla["text"] != "X" and casilla["text"] != "O"):
            casilla["text"] = ""


def showPossible(x):
    if x == 1 or x == 4 or x == 7:
        posiciones = [x-3, x+3, x-1, x+1]
    elif x==2 or x==5 or x == 7:
        posiciones = [x-3,x+3,x-1,9]
    else:
        posiciones = [x-3,x+3,x+1,9]
    deselect()
    for posicion in posiciones:
        if posicion >-1 and posicion < 9:
            if str(casillas[posicion].cget("text")) != "O" and str(casillas[posicion].cget("text")) != "X":
                casillas[posicion].config(bg="#f00")

def clickear(x): # esta funcion sirve para marcar la casilla si no esta ocupada
    global jugadas, movePos
    if(str(casillas[x].cget('text')) != "X" and str(casillas[x].cget('text')) != "O" and jugadas < MAXJUGADAS): # se verifica que no este ocupada
        jugadas+=1
        clientS.send(f"{player},{x}".encode()) # se envia al servidor la casilla dibujada, se envia con formato (jugador, posicion)
        dibujar(player,x) # se dibuja la casilla en el cliente
    elif(str(casillas[x].cget('text')) == player and jugadas == MAXJUGADAS):
        showPossible(x)
        movePos = x
    elif(casillas[x]["bg"] == "#f00"):
        dir = ""
        if movePos == x+3:
            dir = "↑"
        elif movePos == x-3:
            dir = "↓"
        elif movePos == x+1:
            dir = "←"
        elif movePos == x-1:
            dir = "→"
        removeLast()
        clientS.send(f"{dir},{movePos}".encode())
        clientS.send(f"{player},{x}".encode())
        dibujar(dir,movePos)
        dibujar(player,x)
        deselect()
        switch()
        checkWinner()


def recvMsg(clientS): # funcion para despues ser usada como hilo para recibir mensajes del servidor
    global turn, titulo
    while 1: # en un bucle infinito
        try:  # se contempla el caso de que haya un error
            data = clientS.recv(1024) # se reciben los mensajes del servidor
            if data: # si hay mensaje
                p, pos = data.decode().split(',') # se separa el mensaje en jugador y posicion marcada
                if p == "I":
                    turn = player != "X"
                    switch()
                    continue
                elif p =="S":
                    titulo["text"] = "Se cerro la sesion"
                    switchState(DISABLED)
                    clientS.send(b"S, cerrar sesion")
                    clientS.close()
                elif p == "↑" or p == "↓" or p== "←" or p =="→":
                    removeLast()
                    dibujar(p, pos)
                    switch()
                    continue
                dibujar(p,pos) # se dibuja ese mensaje
            else: # si no hay mensaje 
                print('server disconnect') # se avisa
                clientS.close() # y se cierra la conexion
                break # jajajja re feo
        except Exception as e: # si hay un error se printea y se cierra la conexion
            print(f"Error: {e}")
            clientS.close()
            break


def on_closing():
    
    try:
        clientS.send(b"S, cerrar sesion")
        clientS.close()
    except Exception as e:
        pass
    root.destroy()

clientS = socket(AF_INET, SOCK_STREAM) # se configura socket en TCP
clientS.connect(('localhost', 12345)) # se escucha el servidor local con puerto 12345

recieve = threading.Thread(target=recvMsg, args=(clientS,)) # se inicia socket para recibir mensajes

data = clientS.recv(1024) # se recibe el primer mensaje (que indica que jugador es)

player = data.decode() # se decodifica el mensaje y se setea el jugador


turn = False # si sos x es sos el primer turno
turnText = "tu turno" if player!="O" else "Espera..." # se crea mensaje si del turno (es tu turno o espera...)

root = Tk() # se inicia una ventana de la interfaz

root.resizable(0, 0) # no se puede cambiar de tamaño ni en x ni en y en la interfaz
titulo = Label(text=f"{player}, {turnText}", height=2, font=("Roboto 15")) # se pone el texto indicando el jugador y el turno
titulo.grid(columnspan=3, column=0, row=0) # se coloca ese texto arriba del todo
casillas = [] # se declara variable de casillas
for x in range(9): # se crean 9 casillas y se ubican
    size = 5 #  se declara en tamaño (no se en que unidad es)
    casilla = Button(root,
                     font=("Roboto 15"),
                     text='',
                     width=int(size*2.2),
                     height=size
                     ) # se crea la casilla 
    casillas.append(casilla) # se agrega a array de casillas

    if x <= 2: # este if sirve para determinar en que fila esta
        fil = 0
    elif x <= 5:
        fil = 1
    else:
        fil = 2
    casilla.grid(column=(x-(fil*3)), row=fil+1) # se pone en la ventana la casilla

# se define el onclick de cada casilla (no supe como hacerlo mejor)
casillas[0].config(command=lambda: clickear(0), bg="#fff")
casillas[1].config(command=lambda: clickear(1), bg="#fff")
casillas[2].config(command=lambda: clickear(2), bg="#fff")
casillas[3].config(command=lambda: clickear(3), bg="#fff")
casillas[4].config(command=lambda: clickear(4), bg="#fff")
casillas[5].config(command=lambda: clickear(5), bg="#fff")
casillas[6].config(command=lambda: clickear(6), bg="#fff")
casillas[7].config(command=lambda: clickear(7), bg="#fff")
casillas[8].config(command=lambda: clickear(8), bg="#fff")

# si no es tu turno (si sos la O) se te deshabilitan las casillas
if(not turn):
    switchState(DISABLED)

recieve.start() # se inicia el thread de recibir mensajes
root.protocol("WM_DELETE_WINDOW", on_closing)

root.mainloop() # se hace mainloop de la ventana ( no se bien para que sirve pero sin eso la interfaz no anda)
