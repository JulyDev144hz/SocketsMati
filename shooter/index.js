import express from "express";
import { Server as Socket } from "socket.io";
import { Server as HTTPserver } from "http";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const server = new HTTPserver(app)
const io = new Socket(server)

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.set("views",path.join(__dirname,"views"))
app.set("view engine", "ejs")
app.use('/public',express.static(path.join(__dirname,'public')))


app.get("/",(req,res)=>{
    res.render("test")
})
let clients = []
io.on("connection", async client=>{
    client.emit('init', clients.length)
    console.log("Nuevo Usuario Conectado\n Usuario N*"+clients.length)

    clients.map(c=>{
        if(c!=client){
            c.emit('NewPlayer', {color:clients.length})
        }
    })
    clients.push(client)


    client.on('disconnect',e=>{
        console.log('cliente desconectado')
        clients = clients.filter(c=>{
            return c!=client
        })
    })

    client.on("move",e=>{
        
        clients.map(c=>{
            if (c != client){
              
                c.emit('move', e)
            }
        }) 
    })
    client.on("shoot",e=>{
        
        clients.map(c=>{
            if (c != client){
              
                c.emit('shoot', e)
            }
        }) 
    })
})
// try {
// } catch (error) {
//     console.log("Error con los sockets")
// }

server.listen(3000, ()=>{
    console.log("http://localhost:3000")
})