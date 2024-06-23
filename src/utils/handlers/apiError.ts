export class ApiError extends Error{
    statusCode:number;
    message: string;
    data: null;
    success: false;
    errors: any[]
    stack?: string | undefined;

    constructor(statusCode: number, message:string = "Something Went Wrong...", errors: any[] = [], stack:string=""){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors;

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}