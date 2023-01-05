import './style.css';
import {Game} from './game';
import jQuery from 'jquery';



jQuery(() => {
  let game = new Game();
  game.loadModels().then(() => {
    alert("Models loaded");
  });
});

