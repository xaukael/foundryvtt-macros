let display = 
//'row';
'column';

let t = '';
if (!token) token = _token;
if (!token) actor = game.user.character;
else actor = token.actor;
if (!actor) return ui.notifications.error("No Actor");;
token = null;
t = actor.uuid.replaceAll('.','_');
if($(`#menu-${t}`).length) return ui.windows[$(`#menu-${t}`).attr('data-appid')].close();

let types = [];

for (let [type, array] of Object.entries(actor.itemTypes) ) {
  if (type==='backpack') continue;
  if (type==='class') continue;
  if (array.length>0)
    types.push(type.capitalize());
}
let length = types.length + 7;
if (types.includes('Spells')) length ++;
let list=`<div style="display:grid; grid-template-${display}s: repeat(${length}, auto); grid-${display}-gap: .6em;">`;
for (let type of types){
  list += 
  `<a id="open-category-${type}-${t}" name="${type.toLowerCase()}" data-t="${t}" class="type-link">
    <p style="font-size: 1.2em; font-weight: semibold; margin: 3px" >
      ${type==='Feat'?'Features':((['Equipment', 'Loot'].includes(type))?type:type+'s')} 
    </p>
  </a>`;
  if (type==='Spell') list += `
  <a onclick="game.macros.find(m=>m.data.flags.world?.name==='Spell Preparation').execute();">
    <p style="font-size: 1.2em; font-weight: semibold; margin: 3px" >Prepare</p>
  </a>`;
}

list += `
<a style="" class="menu-roll-dialog-button-${t}" name="${t}-abilities-test">
  <p style="font-size: 1.2em; font-weight: semibold; margin: 3px" >Abilities</p>
</a>
<a style="" class="menu-roll-dialog-button-${t}" name="${t}-abilities-save">
  <p style="font-size: 1.2em; font-weight: semibold; margin: 3px" >Saves</p>
</a>
<a style="" class="menu-roll-dialog-button-${t}" name="${t}-skills-check">
  <p style="font-size: 1.2em; font-weight: semibold; margin: 3px" >Skills</p>
</a>
<a  onclick="_token.actor.rollInitiative()">
  <p style="font-size: 1.2em; font-weight: semibold; margin: 3px">Initiative</p>
</a>
<a id="${t}-ce" data-t="${t}" >
  <p style="font-size: 1.2em; font-weight: semibold; margin: 3px" >Effects</p>
</a>
<span style="font-size: 1.2em; font-weight: semibold; margin: 3px">
  <label for="${t}-closeOnMouseLeave">Auto-Close</label><input type="checkbox" id="${t}-closeOnMouseLeave" style="float:right; margin-top:0px;">
</span>
`;

new Dialog({
  title: `${actor.name}`,
  content:  list,
  buttons: {},
  render: ()=>{
    
    $(`#menu-${t}`).click(async function(e){
        console.log(t);
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
      });
    
    $('.type-link').click(function (e) {
      let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
      game.macros.find(m=>m.data.flags.world?.name==='Character Dialog').execute($(this).attr('data-t').replaceAll('_','.'), $(this).attr('name'), {left : e.clientX- 15 , top: e.clientY+15 }, closeOnMouseLeave);
    });
    
    $(`#${t}-ce`).click(function (e) {
      let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
       game.macros.find(m=>m.data.flags.world?.name==='Actor Effects List').execute($(this).attr('data-t').replaceAll('_','.'), {left : e.clientX- 15 , top: e.clientY+15 }, closeOnMouseLeave)
    });
    
    $(`#${t}-closeOnMouseLeave`).prop('checked', game.user.data.flags.world.ActorMenuAutoClose);

    $(`#${t}-closeOnMouseLeave`).change(async function() {
        await game.user.setFlag('world', 'ActorMenuAutoClose', $(this).is(":checked"));       
    });
    
    
    $(`.menu-roll-dialog-button-${t}`).each(function() {
        $(this).click(async function(e){
          let closeOnMouseLeave = $(`#${t}-closeOnMouseLeave`).is(":checked");
          let vars = this.name.split('-');
          game.macros.find(m=>m.data.flags.world?.name==='Roll Dialog').execute(vars[0].replaceAll('_','.'),vars[1],vars[2], {left: e.clientX - 15, top: e.clientY + 15}, closeOnMouseLeave);
        });
    });
     
    
    $(`#menu-${t}`).find(`section.window-content`).click(async function(e){
        
        let placeables = canvas.tokens.placeables.filter(tp => tp.actor?.uuid === t.replaceAll('_','.'))
        if (placeables.length > 0)
          placeables[0].control({releaseOthers:true});
        else 
          canvas.tokens.releaseAll();
        
        for ( let w of Object.values(ui.windows).filter(w=> w.id !== `menu-${t}` && w.id.includes(`${t}`)))
          ui.windows[w.appId].bringToTop();
      });
  },
  close:   html => {
    for ( let w of Object.values(ui.windows).filter(w=> w.id !== `menu-${t}` && w.id.includes(`${t}`)))
          ui.windows[w.appId].close();
      return;}
},{ width: 'auto',  left: 110, top: 80, id: `menu-${t}`}
).render(true);