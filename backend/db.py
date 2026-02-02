from motor.motor_asyncio import AsyncIOMotorClient
from init_env import config

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        self.client = AsyncIOMotorClient(config.MONGO_URI)
        self.db = self.client[config.DB_NAME]
        print("Connected to MongoDB via Motor")

    def close(self):
        if self.client:
            self.client.close()
            print("Closed MongoDB connection")

    def get_collection(self, collection_name: str):
        return self.db[collection_name]

# Global database instance
db_instance = Database()