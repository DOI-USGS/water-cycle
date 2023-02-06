<template>
  <div class="sidebar collapsed opacity">
    <div class="sidebarContent">
      <div class="titleAndExit">
        <h3>
          <button
            class="button reveal"
            @click="toggle"
          >
            <slot name="sidebarTitle">
              Contributors
            </slot>
          </button>
        </h3>
        <div
          class="exit hidden"
          @click="toggle"
        >
          <h3>
            X
          </h3>
        </div>
      </div>
      <div class="messageArea">
        <div class="message">
          <slot name="sidebarMessage">
            <authorship class="hidden"/>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: "SidebarTwo",
    components: {
        authorship: () => import( /* webpackPreload: true */ /*webpackChunkName: "section"*/ "./../components/Authorship")
    },
    mounted(){
        window.addEventListener("load", () => this.setDimensions());
    },
    methods:{
        setDimensions(){
            const sidebar = this.$el;
            const button = this.$el.querySelector(".reveal")
            const buttonDimensions = button.getBoundingClientRect();
            sidebar.style.height = `${buttonDimensions.height}px`;
            sidebar.style.width = `${buttonDimensions.width}px`;
            sidebar.classList.remove("opacity");
        },
        toggle(){
            const exit = this.$el.querySelector(".exit");
            const sidebarButton = this.$el.querySelector(".reveal")
            const authorText = this.$el.querySelector("#author-container")
            exit.classList.toggle("hidden");
            authorText.classList.toggle("hidden");
            sidebarButton.classList.toggle("button");
            if(this.$el.classList.contains("expanded")){ 
                this.$el.classList.remove("expanded");
                this.$el.classList.add("collapsed");
                this.setDimensions();
            }else{
                this.$el.classList.remove("collapsed");
                this.$el.classList.add("expanded");
                this.$el.style.width = "auto";
                this.$el.style.height = "auto";
            }   
        }
    }
}
</script>
<style lang="scss" scoped>
$diagramBlue: #016699;
.sidebar{
    display: flex;
    flex-direction: row;
    transition: width 2s, height 2s, transform 2s;
    will-change: width;
    border-radius: 5px;
    transition: opacity 0.3s;
}
.titleAndExit{
    position: relative;
}
.expanded {
  background: $diagramBlue;
  margin: 0 5px 0 0 ;
}
.expanded h3 {
  color: #fff;
  padding: 5px 10px;
}
.button {
    border-radius: 0.25rem;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 2.5px 5px 2.5px 5px;
    max-width: 24rem;
    background-color: white;
    border: 0.5px solid #949494;
    border-radius: 0.25rem;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }
  .button:hover {
    background-color: $diagramBlue;
    color: white;
    @media screen and (max-width: 600px) {
      background-color: white;
      color: black;
    }
  }
.opacity{
  opacity: 0;
}
.exit{
    position: absolute;
    right: 5px;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    padding: 5px;
    border-radius: 5px;
}
.exit h3 {
  border-radius: 5px;
  line-height: 0.8em;
  cursor: pointer;
    &:hover{
        font-weight: 700;
    }
}
.messageArea{
    padding:0 10px 10px 10px;
}
.message{
    background: #fff;
    padding: 10px;
    *{
      padding-top: 0;
      margin-bottom: 10px;
      &:last-child{
        margin-bottom: 0;
      }
    }
}
.collapsed{
    .message{
        width: 0;
        height: 0;
        opacity: 0;
    }
}
.hidden{
    display: none;
}
</style>