import { Component, OnInit } from '@angular/core';
import { Recipe } from "../recipe.model";
import { RecipeService } from "../recipe.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import { Store } from "@ngrx/store";
import * as fromApp from '../../store/app.reducer';
import {map, switchMap} from "rxjs/operators";
import { State } from "../store/recipe.reducer";
import * as RecipeActions from '../store/recipe.actions';
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {

  recipe: Recipe;

  id: number;

  constructor(private recipeService: RecipeService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(map((params: Params) => +params['id']),
        switchMap((id: number) => {
          this.id = id;
          return this.store.select('recipes')
        }),
        map((recipeState: State) => {
          return recipeState.recipes.find((recipe: Recipe, index: number) => index === this.id)
        })
      ).subscribe((recipe: Recipe) => this.recipe = recipe);
  }

  onAddToShoppingList() {
    this.store.dispatch(new ShoppingListActions.AddIngredients(this.recipe.ingredients));
  }

  onEditRecipe() {
    this.router.navigate([ 'edit' ], { relativeTo : this.activatedRoute });
  }

  onDeleteRecipe() {
    // this.recipeService.deleteRecipe(this.id);
    this.store.dispatch(new RecipeActions.DeleteRecipe(this.id));
    this.router.navigate(['/recipes']);
  }
}
