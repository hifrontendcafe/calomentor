export interface TimeSlot {
  id: string;
  user_id: string;
  date: number;
  is_occupied: boolean;
  is_cancelled?: boolean;
  mentee_username: string;
  mentee_id: string;
  tokenForCancel: string;
}

export interface Mentorship {
  mentee_email: string;
  mentee_username_discord: string;
  mentor_email: string;
  feedback_mentor: string;
  feedback_mentee: string;
  mentor_id: string;
  mentor_name: string;
  info: string;
  mentee_name: string;
  tokenForCancel: string;
  mentee_id: string;
  mentorship_status: "CANCEL" | "ACTIVE" | "CONFIRMED";
  id: string;
  cancel_cause: string;
  who_cancel: "MENTOR" | "MENTEE";
  time_slot_info?: TimeSlot;
  time_slot_id?: string;
  feedback_mentee_private?: string;
}