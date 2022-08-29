import {MedicationController} from "./../controller/MedicationController"
import {AuthController} from "./../controller/AuthController"

export class Routes {
    public medicationController: MedicationController = new MedicationController
    public authController: AuthController = new AuthController()


    public routes(app:any): void {
        app.route('/').get()
        //AUTHENTICATION ROUTES
        app.route("/auth/register").post(this.authController.register)
        app.route("/auth/login").post(this.authController.login)
        app.route("/auth/logout").get(this.authController.logout)

        // MEDICATION ROUTES
        app.route("/").get(this.medicationController.getAll)
    }
}