import { Actions, Effect, ofType } from "@ngrx/effects";
import * as RecipeActions from './recipe.actions';
import { map, switchMap, withLatestFrom } from "rxjs/operators";
import { Recipe } from "../recipe.model";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromApp from '../../store/app.reducer';

@Injectable()
export class RecipeEffects {

  @Effect()
  fetchRecipes = this.actions$.pipe(
    ofType(RecipeActions.FETCH_RECIPES),
    switchMap(() => {
      return this.httpClient
        .get<Recipe[]>('https://ng-recipe-book-5fd54-default-rtdb.firebaseio.com/recipes.json');
    }),
    map((recipes: Recipe[]) => {
      return recipes.map((recipe) => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        };
      });
    }),
    map((recipes: Recipe[]) => {
      return new RecipeActions.SetRecipes(recipes);
    })
  );

  @Effect({
    dispatch: false
  })
  storeRecipes = this.actions$.pipe(
    ofType(RecipeActions.STORE_RECIPES),
    withLatestFrom(this.store.select('recipes')),
    switchMap(([actionData, recipeState]) => {
      return this.httpClient
        .put('https://ng-recipe-book-5fd54-default-rtdb.firebaseio.com/recipes.json',
          recipeState.recipes);
    })
  );

  constructor(private actions$: Actions,
              private httpClient: HttpClient,
              private store: Store<fromApp.AppState>) {}
}
