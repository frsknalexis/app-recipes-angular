import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { Recipe } from "../recipe.model";
import { Store } from "@ngrx/store";
import * as fromApp from '../../store/app.reducer';
import {map} from "rxjs/operators";
import { State } from "../store/recipe.reducer";
import * as RecipeActions from '../store/recipe.actions';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit, OnDestroy {

  id: number;

  editMode: boolean = false;

  recipeForm: FormGroup;

  private storeSubscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private store: Store<fromApp.AppState>) { }

  ngOnInit(): void {
    this.activatedRoute.params
      .subscribe((params: Params) => {
        this.id = +params['id'];
        this.editMode = params['id'] != null;
        this.initForm();
      });
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray([]);

    if (this.editMode) {
      this.storeSubscription = this.store.select('recipes')
        .pipe(
          map((recipeState: State) =>
            recipeState.recipes.find((recipe: Recipe, index: number) => index === this.id)))
        .subscribe((recipe: Recipe) => {
          recipeName = recipe.name;
          recipeImagePath = recipe.imagePath;
          recipeDescription = recipe.description;
          if (recipe.ingredients) {
            recipe.ingredients.forEach((ingredient) => {
              recipeIngredients.push(new FormGroup({
                'name': new FormControl(ingredient.name, Validators.required),
                'amount': new FormControl(ingredient.amount, [ Validators.required,
                  Validators.pattern(/^[1-9]+[0-9]*$/) ])
              }));
            });
          }
        });
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });
  }

  getIngredientsControls() {
    return (<FormArray>this.recipeForm.get('ingredients')).controls;
  }

  onAddIngredient() {
    (<FormArray>this.recipeForm.get('ingredients'))
      .push(new FormGroup({
        'name': new FormControl(null, Validators.required),
        'amount': new FormControl(null, [ Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/) ])
      }));
  }

  onSubmit() {
    console.log(this.recipeForm.value);
    const newRecipe = new Recipe(this.recipeForm.value.name, this.recipeForm.value.description,
      this.recipeForm.value.imagePath, this.recipeForm.value.ingredients);
    if (this.editMode) {
      this.store.dispatch(new RecipeActions.UpdateRecipe({
        index: this.id,
        newRecipe: newRecipe
      }));
    } else {
      this.store.dispatch(new RecipeActions.AddRecipe(newRecipe));
    }
    this.onCancel();
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo : this.activatedRoute });
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  ngOnDestroy() {
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }
}
