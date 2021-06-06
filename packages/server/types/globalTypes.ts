interface GlobalBody {
  code: number;
  message: string;
  data: any;
}
export interface GlobalResponse {
  statusCode: number;
  body: GlobalBody;
}
