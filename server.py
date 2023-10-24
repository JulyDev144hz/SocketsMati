# se importa sockets e hilos
from socket import *
import threading

clients = [] # se declara el array clientes
def recvMsg(clientS): # se hace funcion para recibir los mensajes de los clientes
    while 1: # se hace un bucle infinito
        try: # se hace trycatch para manejar los errores
            data = clientS.recv(1024) # recibe los mensajes del cliente
            if not data: # si no hay mensaje se termina el bucle
                break

            for client in clients: # se reenvia el mensaje a todos clos clientes menos el emisor
                if client != clientS:
                    try:
                        client.send(data)
                    except: # si hay error se cierra la conexion y se le saca del array clientes
                        client.close()
                        clients.remove(client)
            if data.decode().split(",")[0] == "S":
                print("Se cerro la sesion")
                raise Exception("Se cerro la sesion")
        except: # si hay error se cierra la conexion y se le saca del array clientes
            clientS.close()
            clients.remove(clientS)
            print(clients)
            break

server = socket(AF_INET,SOCK_STREAM) # se configura socket en tcp
server.bind(("localhost",12345)) # se abre server en el servidor local puerto 12345
server.listen(2) # maximo de 2 conexiones
print("Server Iniciado") #


while 1: # bucle infinito
    clientS,clientAddr = server.accept() # se acepta las conexiones
    if(clients.__len__() ==2): # si hay mas de 2 conexiones no se le permite jugar
        clientS.send(b"Maximo de jugadores permitidos")
        clientS.close()
        continue
    clients.append(clientS) # se agrega a clientes
    if clients.__len__() == 1: # si es el primer cliente se lo configura como X
        clientS.send(b"X")
    else: #sino es O
        clientS.send(b"O")
        for client in clients:
            client.send(b"I, Iniciar sesion")
    clientHandler = threading.Thread(target=recvMsg, args=(clientS,)) #se define el thread para escuchar esa conexion
    clientHandler.start() # se inicia el hilo de escucha de ese cliente

                
        