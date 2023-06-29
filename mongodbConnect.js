import { MongoClient } from "mongodb";

const mongodb_url =
  "mongodb+srv://aankit8295:pKoYs2iukVU5dDkW@clusterlink.foodk0p.mongodb.net/?retryWrites=true&w=majority";

const db_name = "llink_db";
const connectionOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export async function dbConnect() {
  const connection = await MongoClient.connect(mongodb_url, connectionOpts)
    .then((data) => {
      console.info("connected to db");
      return data;
    })
    .catch((e) => {
      console.log("error:", e);
    });

  let db = connection.db(db_name);
  return db.collection("users");
}
