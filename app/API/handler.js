/**
 * Lambda function as a REST API to interface with sensor data in Dynamo DB
 * @module API
 */
import { hello, create, read, update, del } from './v1/index.js';

export { hello, create, read, update, del };