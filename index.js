import { dbConnect } from "./mongodbConnect.js";

const getData = async () => {
  let data = await dbConnect();
  data = await data.find().toArray();
  console.log(data);
};

getData();
