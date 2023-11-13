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


app.get("/",(req,res)=>{
    res.render("test")
})

try {
    io.on("connection", async client=>{
        io.sockets.emit("init", "Conectado Exitosamente")
    })
    io.on("message",e=>{
        console.log(e)
        io.sockets.emit("message", e)
    })
} catch (error) {
    console.log("Error con los sockets")
}

server.listen(3000, ()=>{
    console.log("http://localhost:3000")
})