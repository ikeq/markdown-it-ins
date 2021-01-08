'use strict';

module.exports = function (options = {}) {
  var marker_symbol = (options.marker || "$")[0];
  var marker_code_string = "0x" + marker_symbol.codePointAt(0).toString(16);
  var marker_code = Number(marker_code_string);
  var tag_name = options.tag || "tag-" + marker_code_string;

  return function plugin(md) {
    // Insert each marker as a separate text token, and add it to delimiter list
    //
    function tokenize(state, silent) {
      var i,
        scanned,
        token,
        len,
        ch,
        start = state.pos,
        marker = state.src.charCodeAt(start);

      if (silent) {
        return false;
      }

      if (marker !== marker_code) {
        return false;
      }

      scanned = state.scanDelims(state.pos, true);
      len = scanned.length;
      ch = String.fromCharCode(marker);

      if (len < 2) {
        return false;
      }

      if (len % 2) {
        token = state.push('text', '', 0);
        token.content = ch;
        len--;
      }

      for (i = 0; i < len; i += 2) {
        token = state.push('text', '', 0);
        token.content = ch + ch;

        if (!scanned.can_open && !scanned.can_close) {
          continue;
        }

        state.delimiters.push({
          marker: marker,
          length: 0, // disable "rule of 3" length checks meant for emphasis
          jump: i / 2, // 1 delimiter = 2 characters
          token: state.tokens.length - 1,
          end: -1,
          open: scanned.can_open,
          close: scanned.can_close,
        });
      }

      state.pos += scanned.length;

      return true;
    }

    // Walk through delimiter list and replace text tokens with tags
    //
    function postProcess(state, delimiters) {
      var i,
        j,
        startDelim,
        endDelim,
        token,
        loneMarkers = [],
        max = delimiters.length;

      for (i = 0; i < max; i++) {
        startDelim = delimiters[i];

        if (startDelim.marker !== marker_code /* + */) {
          continue;
        }

        if (startDelim.end === -1) {
          continue;
        }

        endDelim = delimiters[startDelim.end];

        token = state.tokens[startDelim.token];
        token.type = tag_name + '_open';
        token.tag = tag_name;
        token.nesting = 1;
        token.markup = marker_symbol.repeat(2);
        token.content = '';

        token = state.tokens[endDelim.token];
        token.type = tag_name + '_close';
        token.tag = tag_name;
        token.nesting = -1;
        token.markup = marker_symbol.repeat(2);
        token.content = '';

        if (state.tokens[endDelim.token - 1].type === 'text' && state.tokens[endDelim.token - 1].content === marker_symbol) {
          loneMarkers.push(endDelim.token - 1);
        }
      }

      // If a marker sequence has an odd number of characters, it's splitted
      // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
      // start of the sequence.
      //
      // So, we have to move all those markers after subsequent s_close tags.
      //
      while (loneMarkers.length) {
        i = loneMarkers.pop();
        j = i + 1;

        while (j < state.tokens.length && state.tokens[j].type === tag_name + '_close') {
          j++;
        }

        j--;

        if (i !== j) {
          token = state.tokens[j];
          state.tokens[j] = state.tokens[i];
          state.tokens[i] = token;
        }
      }
    }

    md.inline.ruler.before('emphasis', tag_name, tokenize);
    md.inline.ruler2.before('emphasis', tag_name, function (state) {
      var curr,
        tokens_meta = state.tokens_meta,
        max = (state.tokens_meta || []).length;

      postProcess(state, state.delimiters);

      for (curr = 0; curr < max; curr++) {
        if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
          postProcess(state, tokens_meta[curr].delimiters);
        }
      }
    });
  };
};
