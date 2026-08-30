export class Success extends Error {
    constructor(message: string) {
        super(message);
        this.name = "success";
        throw this;
    }
}