import json, random, redis, time
import tornado.ioloop
import tornado.web
import tornado.websocket

from app import SensorApp
from dotenv import dotenv_values

# Adapted from https://www.georgeho.org/tornado-websockets/ and https://phrase.com/blog/posts/tornado-web-framework-i18n/
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        user_locale = self.get_user_locale()
        self.write("Hello, world")

class LocaleHandler(tornado.web.RequestHandler):
    def get(self, locale):
        self.locale = tornado.locale.get(locale)
        self.render("index.html", locale=locale)

class WebSocketServer(tornado.websocket.WebSocketHandler):
    
    clients = set()
    
    def open(self):
        print("WebSocket opened")
        WebSocketServer.clients.add(self)
        print(WebSocketServer.clients)

    def on_message(self, message):
        print(f"on_message received")

        message = json.loads(message)
        command = message["command"]
        appResponse = app.handleCommand(command)
        ack = None
        data = None
        if appResponse["error"] == 0:
            ack = "ack"
        else:
            ack = "nack"
        if "data" in appResponse:
            data = appResponse["data"]
        response = {
            "ack": ack,
            "data": data
        }
        self.write_message(json.dumps(response))
        print(f"::::: command completed with response :: {response}")
        

    def on_close(self):
        print("WebSocket closed")
        WebSocketServer.clients.remove(self)

    @classmethod
    def send_message(cls, message: str):
        print(f"Sending message {message} to {len(cls.clients)} client(s).")
        for client in cls.clients:
            client.write_message(message)


def make_app():
    return tornado.web.Application([
            (r"/", MainHandler),
            (r"/websocket/", WebSocketServer),
            (r"/([^/]+)/about-us", LocaleHandler),
        ],
        template_path="templates/",
        static_path="templates/",
        websocket_ping_interval=10,
        websocket_ping_timeout=30,
    )
def main(serverPort:int):

    app = make_app()
    app.listen(serverPort)

    io_loop = tornado.ioloop.IOLoop.current()
    io_loop.start()

if __name__ == "__main__":
    # Get Config from Env Vars
    config = dotenv_values(".env")
    
    serialNumber = config["SERIAL_NUMBER"]
    serverPort = config["SERVER_PORT"]
    dbHost = config["DB_HOST"]
    dbPort = config["DB_PORT"]
    dbId = config["DB_ID"]
    
    tornado.locale.load_translations('locale/')

    app = SensorApp(serialNumber,dbHost,dbPort,dbId)
    print(f"App Setup with serial number: {app.getSerialNumber()}")
    
    main(serverPort)