import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AuthComponent } from "./auth.component";
import { AuthRoutingModule } from "./auth-routing.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [
    AuthComponent
  ],
  imports: [
    FormsModule,
    AuthRoutingModule,
    SharedModule
  ]
})
export class AuthModule {  }
