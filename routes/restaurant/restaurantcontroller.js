import { find, findById, create } from "./restaurantmodel";
import { create as _create } from "../meal/mealmodel";
import { merge } from "lodash";

function handleError(res, err) {
  return res.send(500, err);
}

// Get list of restaurants
export function index(req, res) {
  find(function(err, restaurants) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, restaurants);
  });
}

// Get a single restaurant
export function show(req, res) {
  findById(req.params.id)
    .populate("_meals")
    .exec(function(err, restaurant) {
      if (err) {
        return handleError(res, err);
      }

      if (!restaurant) {
        return res.send(404);
      }

      return res.json(restaurant);
    });
}

export function create(req, res) {
  _create(req.body._meals, function(err) {
    if (err) {
      return handleError(res, err);
    }
    const _meals = [];

    for (let i = 0; i < arguments[1].length; i++) {
      _meals.push(arguments[1][i]._id);
    }

    const _restaurant = req.body;
    _restaurant._meals = _meals;

    create(_restaurant, function(err, restaurant) {
      if (err) {
        return handleError(res, err);
      }

      restaurant.populate();

      return res.json(201, restaurant);
    });
  });
}

// Updates an existing restaurant in the DB.
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  findById(req.params.id, function(err, restaurant) {
    if (err) {
      return handleError(res, err);
    }
    if (!restaurant) {
      return res.send(404);
    }
    const updated = merge(restaurant, req.body);
    updated.save(function(err) {
      if (err) {
        return handleError(res, err);
      }

      return res.json(200, restaurant);
    });
  });
}

// Deletes a restaurant from the DB.
export function destroy(req, res) {
  findById(req.params.id, function(err, restaurant) {
    if (err) {
      return handleError(res, err);
    }
    if (!restaurant) {
      return res.send(404);
    }
    restaurant.remove(function(err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
}
