import { MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';


declare global {
  var signin: (id?:string) => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => { 
  process.env.JWT_KEY = 'fkjkfdkjfkd';
  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks(); 

  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }

});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?:string) => {
  // build a JWT payload. {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  }
  // Create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!)


  //build session object {jwt: MY_JWT}
  const session = {jwt: token}

//Turn the session into JSON
  const sessionJSON = JSON.stringify(session)
  // Turn object into JSON and encode as base 64

  const base64 = Buffer.from(sessionJSON).toString('base64')

  //return a string that is cookie with encoded data
  return [`session=${base64}`]

}