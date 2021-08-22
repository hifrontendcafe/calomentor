import { throwResponse } from "./throwResponse";

export const createAndUpdateUserValidations = (
  callback,
  discord_username,
  full_name,
  email,
  url_photo,
  role,
  links,
  skills
) => {
  let errorMessage = "";

  if (!discord_username || typeof discord_username !== "string" ) {
    errorMessage = "Bad Request: discord_username is required or it's not a string.";
    throwResponse(callback, errorMessage, 400);
  }

  if (!full_name || typeof full_name !== "string" ) {
    errorMessage = "Bad Request: full_name is required or it's not a string.";
    throwResponse(callback, errorMessage, 400);
  }

  if (!email || typeof email !== "string" ) {
    errorMessage = "Bad Request: email is required or it's not a string.";
    throwResponse(callback, errorMessage, 400);
  }

  if (!url_photo || typeof url_photo !== "string" ) {
    errorMessage = "Bad Request: url_photo is required or it's not a string.";
    throwResponse(callback, errorMessage, 400);
  }

  if (!role || !role.length || !Array.isArray(role)) {
    errorMessage = "Bad Request: role is required or it's not an array.";
    throwResponse(callback, errorMessage, 400);
  }

  if (
    !links ||
    Array.isArray(links) ||
    typeof links !== "object" ||
    Object.keys(links).length === 0
  ) {
    errorMessage = "Bad Request: links is required or it's not an object.";
    throwResponse(callback, errorMessage, 400);
  }

  if (!skills || !skills.length || !Array.isArray(skills)) {
    errorMessage = "Bad Request: skills is required or it's not an array.";
    throwResponse(callback, errorMessage, 400);
  }
};
