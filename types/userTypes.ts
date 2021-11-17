interface UserLinks {
  github: string;
  twitter: string;
  linkedin: string;
  portfolio: string;
}

export interface User {
  id: string;
  discord_username?: string;
  full_name?: string;
  about_me?: string;
  email?: string;
  url_photo?: string;
  role?: string[];
  links?: UserLinks;
  skills?: string[];
  isActive: boolean;
  lastActivateBy: string;
  timezone: string;
}
