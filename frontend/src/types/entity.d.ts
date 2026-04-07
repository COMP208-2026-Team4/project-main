/**
 * Entities are objects retrieved from the API.
 */
namespace Entity {
  class User {
    id: String;
    username: String;
    email?: String;
    avatarURL?: String;
  }

  class Session {
    id: String;
    quality: Number;
    duration: Number;
    createdAt: String;
  }
}