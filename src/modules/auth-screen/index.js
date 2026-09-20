export class AuthScreen{
 #auth;#node;#onReady;
 constructor({auth,onReady}){this.#auth=auth;this.#onReady=onReady;this.#node=document.createElement("section");this.#node.className="auth-screen";this.#node.hidden=true;document.body.append(this.#node);}
 async boot(){return this.#auth.current()}
 show(){this.#node.hidden=false;document.body.classList.add("auth-open");this.#render("login");}
 close(){this.hide();}
 hide(){this.#node.hidden=true;document.body.classList.remove("auth-open");}
 #render(mode){const signup=mode==="signup";this.#node.innerHTML=`<div class="auth-card"><button class="auth-close" type="button" aria-label="Fechar">×</button><small>DIAMOND GAME</small><h1>${signup?"Criar conta":"Entrar"}</h1><p>${signup?"Crie seu perfil de jogador.":"Entre para jogar partidas 1v1."}</p><form><input name="name" placeholder="Nome de jogador" ${signup?"":"hidden"}><input name="email" type="email" autocomplete="email" placeholder="E-mail" required><input name="password" type="password" autocomplete="${signup?"new-password":"current-password"}" minlength="8" placeholder="Senha" required><button>${signup?"Criar conta":"Entrar"}</button><div class="auth-error" aria-live="polite"></div></form><button class="auth-switch">${signup?"Já tenho conta":"Criar minha conta"}</button></div>`;
 this.#node.querySelector(".auth-close").onclick=()=>this.hide();
 this.#node.querySelector(".auth-switch").onclick=()=>this.#render(signup?"login":"signup");
 this.#node.querySelector("form").onsubmit=async e=>{e.preventDefault();const b=e.currentTarget.querySelector("button"),err=this.#node.querySelector(".auth-error"),data=Object.fromEntries(new FormData(e.currentTarget));b.disabled=true;err.textContent="";try{const user=signup?await this.#auth.signUp(data):await this.#auth.signIn(data);this.hide();this.#onReady(user)}catch(x){err.textContent=this.#message(x)}finally{b.disabled=false}};
 }
 #message(error){const msg=String(error?.message||"");if(/network|fetch/i.test(msg))return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";if(/already|exists/i.test(msg))return "Este e-mail já possui uma conta.";if(/credentials|password|email/i.test(msg))return "E-mail ou senha inválidos.";return msg||"Não foi possível autenticar.";}
}
