import { Callback, Context } from "aws-lambda";
import { TABLE_NAME_USER } from "../constants";
import { GlobalResponse } from "../types/globalTypes";
import { throwError } from "../utils/throwError";

const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const createUserService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {

  const { idDiscord, userDiscord, nombreCompleto, email, urlFoto, links, rol, status, especialidades } = JSON.parse(event.body);
  const user = {
    id: idDiscord,
    userDiscord,
    nombreCompleto,
    email,
    urlFoto,
    links,
    rol,
    status,
    especialidades
  }

  if (!idDiscord || !userDiscord || !nombreCompleto) {
    const errorMessage = "Bad Request: idDiscord, userDiscord y nombreCompleto son campos requeridos";
   return throwError(event, context, callback, errorMessage, 400);
  }

  const userInfo = {
    TableName: TABLE_NAME_USER,
    Item: user,
  };

  dynamoDb.put(userInfo).promise()
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `User created succesfully`,
          userId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to create user. Error ${err}`
        })
      })
    });
};

export const getUsersService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {

  const params = {
    TableName: TABLE_NAME_USER,
    ProjectionExpression: "id, nombreCompleto"
  };

  const onScan = (err, data) => {
    if (err) {
      console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
      callback(err);
    } else {
      console.log("Scan succeeded.");
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          users: data.Items
        })
      });
    }
  };
  dynamoDb.scan(params, onScan);
};

export const getUserByIdService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {

  const params = {
    TableName: TABLE_NAME_USER,
    Key: {
      id: event.pathParameters.id,
    }
  };

  dynamoDb.get(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error(`Couldn\'t fetch user with id: ${event.pathParameters.id}`));
      return;
    });
};

export const deleteUserByIdService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {

  const params = {
    TableName: TABLE_NAME_USER,
    ProjectionExpression: "idDiscord, userDiscord, nombreCompleto",
    Key: {
      id: event.pathParameters.id,
    }
  };

  dynamoDb.delete(params).promise()
    .then(result => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    })
    .catch(error => {
      console.error(error);
      callback(new Error(`Couldn\'t delete user with id: ${event.pathParameters.id}`));
      return;
    });
};

export const updateUserByIdService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { userDiscord, nombreCompleto, email, urlFoto, links, rol, status, especialidades } = JSON.parse(event.body);
  const params = {
    TableName: TABLE_NAME_USER,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ":userDiscord": userDiscord,
      ":nombreCompleto": nombreCompleto,
      ":status": status,
      ":email": email,
      ":rol": rol,
      ":urlFoto": urlFoto,
      ":especialidades": especialidades,
      ":links": links
    },
    UpdateExpression: "SET userDiscord = :userDiscord, nombreCompleto = :nombreCompleto, #status = :status, email = :email, rol = :rol, urlFoto = :urlFoto, especialidades = :especialidades, links = :links",
    ReturnValues: "ALL_NEW",
  };
  dynamoDb.update(params, (error, result) => {
    let response: GlobalResponse;
    if (error) {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: "error",
          data: error,
        }),
      };
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          code: 200,
          message: "success",
          result: result.Attributes,
        }),
      };
    }
    callback(null, response);
  });
};

export const activateMentorService = (
  event: any,
  context: Context,
  callback: Callback<any>
): void => {
  const { data } = JSON.parse(event.body);
  const params = {
    TableName: TABLE_NAME_USER,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeValues: {
      ":active": data.status,
    },
    UpdateExpression: "SET active = :active",
    ReturnValues: "ALL_NEW",
  };
  dynamoDb.update(params, (error, result) => {
    let response: GlobalResponse;
    if (error) {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          code: 400,
          message: "error",
          data: error,
        }),
      };
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          code: 200,
          message: "success",
          result: result.Attributes,
        }),
      };
    }
    callback(null, response);
  });
};