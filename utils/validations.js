export const createAndUpdateUserValidations = (
  discord_username,
  full_name,
  email,
  url_photo,
  role,
  links,
  skills
) => {
  let errorMessage = "";

  if (!discord_username || typeof discord_username !== "string") {
    return errorMessage =
      "Bad Request: discord_username is required or it's not a string.";
  }

  if (!full_name || typeof full_name !== "string") {
    return errorMessage = "Bad Request: full_name is required or it's not a string.";
  }

  if (!email || typeof email !== "string") {
    return errorMessage = "Bad Request: email is required or it's not a string.";
  }

  if (!url_photo || typeof url_photo !== "string") {
    return errorMessage = "Bad Request: url_photo is required or it's not a string.";
  }

  if (!role || !role.length || !Array.isArray(role)) {
    return errorMessage = "Bad Request: role is required or it's not an array.";
  }

  if (
    Array.isArray(links) ||
    typeof links !== "object" ||
    Object.keys(links).length === 0
  ) {
    return errorMessage = "Bad Request: links is required or it's not an object.";
  }

  if (!skills || !skills.length || !Array.isArray(skills)) {
    return errorMessage = "Bad Request: skills is required or it's not an array.";
  }

  return errorMessage;
};
