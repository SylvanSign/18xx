import * as tinycolor from "tinycolor2";

import curry from "ramda/src/curry";
import is from "ramda/src/is";
import mergeDeepRight from "ramda/src/mergeDeepRight";

import ColorContext from '../context/ColorContext';
import GameContext from '../context/GameContext';
import PhaseContext from '../context/PhaseContext';

import React from 'react';
import { connect } from 'react-redux';

import games from "./games";
import themes from "./themes";
import companies from "./themes/companies";

const resolveColor = curry((theme, companiesTheme, phase, context, game, name) => {
  let colors = themes[theme || "gmt"] || themes["gmt"];

  // Add in company colors
  colors["companies"] = mergeDeepRight(companies["rob"],
                                       companies[companiesTheme || "rob"] || companies["rob"]);

  // Add in game colors
  colors = mergeDeepRight(colors,
                          game ? game.colors || {} : {});

  // Get color from context if it exists
  let color = colors[name];
  if(colors[context] && colors[context][name]) {
    color = colors[context][name];
  }

  // If color is an object use phase
  if(is(Object,color)) {
    color = color[phase || "default"] || color["default"];
  }
  return color;
});

const textColor = curry((theme, companiesTheme, phase, game, color) => {
  let text = [resolveColor(theme, companiesTheme, phase, null, game, "white"),
              resolveColor(theme, companiesTheme, phase, null, game, "black")];
  let tc = tinycolor.default(color);
  return tinycolor.mostReadable(tc, text).toRgbString();
});

const strokeColor = color => tinycolor(color).darken(10).toString();

const Color = ({ theme, companiesTheme, context, children }) => {
  return (
    <GameContext.Consumer>
      {gameContext => {
        let game = games[gameContext];
        return (
          <ColorContext.Consumer>
            {colorContext => (
              <PhaseContext.Consumer>
                {phase => {
                  let c = resolveColor(theme, companiesTheme, phase, context || colorContext, game);
                  let p = resolveColor(theme, companiesTheme, phase, undefined, game);
                  let t = textColor(theme, companiesTheme, phase, game);
                  let s = strokeColor;

                  return (
                    <React.Fragment>
                      {children(c, t, s, p)}
                    </React.Fragment>
                  );
                }}
              </PhaseContext.Consumer>
            )}
          </ColorContext.Consumer>
        );
      }}
    </GameContext.Consumer>
  );
};

const mapStateToProps = state => ({
  theme: state.config.theme,
  companiesTheme: state.config.companiesTheme
});

export default connect(mapStateToProps)(Color);
