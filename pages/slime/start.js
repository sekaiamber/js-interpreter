import './g.scss';
import Slime from './../../examples/slime';

const $ = window.$;

const slime = new Slime();

function handleError(message) {
  const $result = $('#result');
  $result.empty();
  $result.append(`<div class="alert alert-danger" role="alert">${message}</div>`);
}

const tokenmap = {
  1: 'label-info',
  2: 'label-success',
  3: 'label-warning',
};

function handleSuccess(result) {
  const $result = $('#result');
  const tokens = result._tokens;
  const tokenstr = tokens.map(token => `<span class="token ${tokenmap[token.tag]}">${token.value}</span>`).join('');
  $result.empty();
  const env = result.env;
  const envstr = Object.keys(env).map(key => `<tr><td>${key}</td><td>${env[key]}</td></tr>`).join('');
  $result
    .append('<div class="alert alert-success" role="alert">Success!</div>')
    .append('<h3>Tokens</h3>')
    .append(`<div id="tokens">${tokenstr}</div>`)
    .append('<h3>Results</h3>')
    .append(`<div id="vars"><table class="table table-striped">
  <tr><th>Name</th><th>Value</th></tr>
  ${envstr}
</table></div>`);
}

$(document).ready(() => {
  $('#run').click(() => {
    const code = $('#code').val();
    try {
      const result = slime.eval(code);
      console.log(result);
      handleSuccess(result);
    } catch (error) {
      handleError(error.message);
    }
  });

  $('#run').click();
});
