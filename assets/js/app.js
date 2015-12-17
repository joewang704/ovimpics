import * as timer from './timer.js';
import request from 'superagent';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/addon/selection/mark-selection.js';
import 'codemirror/mode/clike/clike.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/keymap/vim.js';

const editorContainer = document.getElementById('code');

document.getElementById('container').style.display = 'block';

const editor = CodeMirror.fromTextArea(editorContainer, {
  lineNumbers: true,
  mode: "text/x-csrc",
  keyMap: "vim",
  matchBrackets: true,
  showCursorWhenSelecting: true,
  readOnly: true,
  styleSelectedText: true,
  theme: "solarized dark",
  autofocus: true,
  cursorBlinkRate: 0,
  viewportMargin: Infinity,
  resetSelectionOnContextMenu: false,
});

request
  .get('/getCode')
  .end((err, res) => {
    startGame(res.text);
  });

function endGame() {
  timer.endTimer();
  editor.getInputField().blur();
}

function startGame(text) {
  const lines = text.split('\n');
  const destinationLine = Math.floor(Math.random()*lines.length);
  const destinationStartChar = Math.floor(Math.random()*lines[destinationLine].length);
  const destinationEndChar = destinationStartChar + 5;
  editor.setValue(text);
  const winRange = editor.markText({line: destinationLine, ch: destinationStartChar},
      {line: destinationLine, ch: destinationEndChar}, {className: "styled-background"});
  const keyLogger = document.getElementById('key-logger');
  const keyCounter = document.getElementById('key-count');
  let keys = '';
  let keyCount = 0;
  timer.initializeClock('clock');
  CodeMirror.on(editor, 'cursorActivity', function(instance) {
    if (instance.hasFocus()) {
      const cursor = instance.getCursor();
      let currentLine;
      let currentChar;
      if (cursor) {
        currentLine = cursor.line;
        currentChar = cursor.ch;
      }
      if (currentLine === destinationLine
          && currentChar >=  destinationStartChar
          && currentChar <= destinationEndChar) {
        endGame();
      }
    }
  });

  CodeMirror.on(editor, 'vim-keypress', function(key) {
    if (editor.hasFocus()) {
      keys = keys + key;
      keyLogger.innerHTML = keys;
      keyCounter.innerHTML = ++keyCount;
    }
  });

  CodeMirror.on(editor, 'mousedown', function(instance, event) {
    event.preventDefault();
    instance.focus();
  });

  CodeMirror.on(winRange, 'beforeCursorEnter', function() {
    endGame();
  })
}
