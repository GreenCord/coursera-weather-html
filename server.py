import random
import tornado.ioloop
import tornado.web
import tornado.websocket

# Adapted from https://www.georgeho.org/tornado-websockets/ and https://phrase.com/blog/posts/tornado-web-framework-i18n/
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        user_locale = self.get_user_locale()
        self.write("Hello, world")

class LocaleHandler(tornado.web.RequestHandler):
    def get(self, locale):
        self.locale = tornado.locale.get(locale)
        self.render("index.html", product=1, author="Author Name", view=1234)

class WebSocketServer(tornado.websocket.WebSocketHandler):
    
    clients = set()

    def open(self):
        print("WebSocket opened")
        WebSocketServer.clients.add(self)

    def on_message(self, message):
        print(f"on_message received: {message}")
        self.write_message(u"You said: " + message)

    def on_close(self):
        print("WebSocket closed")
        WebSocketServer.clients.remove(self)

    @classmethod
    def send_message(cls, message: str):
        print(f"Sending message {message} to {len(cls.clients)} client(s).")
        for client in cls.clients:
            client.write_message(message)

class RandomBernoulli:
    def __init__(self):
        self.p = 0.72
        print(f"True p = {self.p}")

    def sample(self):
        return int(random.uniform(0, 1) <= self.p)

class WTFHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Huh")

        
def make_app():
    return tornado.web.Application([
            (r"/", MainHandler),
            (r"/websocket/", WebSocketServer),
            (r"/([^/]+)/about-us", LocaleHandler),
        ],
        template_path="templates/",
        websocket_ping_interval=10,
        websocket_ping_timeout=30,
    )
def main():

    app = make_app()
    app.listen(8888)

    io_loop = tornado.ioloop.IOLoop.current()

    random_bernoulli = RandomBernoulli()
    periodic_callback = tornado.ioloop.PeriodicCallback(
        lambda: WebSocketServer.send_message(str(random_bernoulli.sample())), 100
    )
    periodic_callback.start()

    io_loop.start()

if __name__ == "__main__":
    tornado.locale.load_translations('locale/')
    main()