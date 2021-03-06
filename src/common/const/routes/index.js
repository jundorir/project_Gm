import Home from "@pages/Home";
import Union from "@pages/Union";
import Battle from "@pages/Battle";
import BattleExplain from "@pages/Battle/Explain";
import Tavern from "@pages/Tavern";
import Market from "@pages/Market";
import PropsDetail from "@pages/Market/PropsDetail";
import SaleDetail from "@pages/Market/SaleDetail";
import Sale from "@pages/Market/Sale";

import MySale from "@pages/Market/MySale";
import MySaleDetail from "@pages/Market/MySaleDetail";
import MyPropsDetail from "@pages/Market/MyPropsDetail";

// import MyEmployee from "@pages/HeroHire/MyEmployee";
// import MyEmployeeDetail from "@pages/HeroHire/MyEmployee/MyEmployeeDetail";

import HireMarket from "@pages/HeroHire";
import MyHire from "@pages/HeroHire/MyHire";
import MyHireDetail from "@pages/HeroHire/MyHire/MyHireDetail";
import Hire from "@pages/HeroHire/Hire";
import HireDetail from "@pages/HeroHire/HireDetail";
import MyEmployee from "@pages/HeroHire/MyEmployee";
import MyEmployeeDetail from "@pages/HeroHire/MyEmployee/MyEmployeeDetail";
import Inventory from "@pages/Inventory";
import ResourceLoading from "@pages/ResourceLoading";
import Production from "@pages/Production";
import Dispatch from "@pages/Production/Dispatch";
import UnionBattle from "@pages/UnionBattle";
import Hero from "@pages/Hero";
import BattleFormation from "@pages/Hero/BattleFormation";
import UnionManage from "@pages/Union/UnionManage";
import HeroSynthesis from "@pages/Hero/Synthesis";
import HeroDetail from "@pages/Hero/HeroDetail";
import HeroLevelUp from "@pages/Hero/LevelUp";
import HeroStarUp from "@pages/Hero/StarUp";
import Invitation from "@pages/Invitation";
import UnionDonate from "@pages/Union/UnionDonate";
import CardMember from "@pages/CardMember";
import Login from "@pages/Login";
import UnionMain from "@pages/Union/UnionMain";
import UnionList from "@pages/Union/UnionList";
import UnionBattleExplain from "@pages/UnionBattle/Explain";
import CityDetails from "@pages/UnionBattle/CityDetails";

const routes = {
  home: {
    components: Home,
    title: "??????",
    // titleKey: "home",
  },
  battle: {
    components: Battle,
    title: "??????",
    titleKey: "War",
  },
  battleExplain: {
    components: BattleExplain,
    title: "??????",
    titleKey: "War",
  },
  union: {
    components: Union,
    title: "??????",
    titleKey: "Guild",
  },
  unionmain: {
    components: UnionMain,
    title: "?????? ",
    titleKey: "Guild",
  },
  unionlist: {
    components: UnionList,
    title: "?????? ",
    titleKey: "Guild",
  },
  unionmanage: {
    components: UnionManage,
    title: "????????????",
  },
  uniondonate: {
    components: UnionDonate,
    title: "??????",
  },
  market: {
    components: Market,
    title: "??????",
    titleKey: "Market",
  },
  saleDetail: {
    components: SaleDetail,
    title: "????????????",
  },
  propsDetail: {
    components: PropsDetail,
    title: "????????????",
  },
  sale: {
    components: Sale,
    title: "??????",
    titleKey: "Sale",
  },

  mySale: {
    components: MySale,
    title: "????????????",
    titleKey: "My_Sale",
  },
  mySaleDetail: {
    components: MySaleDetail,
    title: "??????????????????",
  },

  myPropsDetail: {
    components: MyPropsDetail,
    title: "??????????????????",
  },
  //TODO???????????????

  hireHero: {
    components: HireMarket,
    title: "????????????",
  },

  myHire: {
    components: MyHire,
    title: "????????????",
  },
  myHireDetail: {
    components: MyHireDetail,
    title: "????????????",
  },
  myEmployee: {
    components: MyEmployee,
    title: "????????????",
  },
  employeerDetail: {
    components: MyEmployeeDetail,
    title: "????????????",
  },
  hire: {
    components: Hire,
    title: "??????",
  },
  hireDetail: {
    components: HireDetail,
    title: "????????????",
    titleKey: "Hire",
  },
  production: {
    components: Production,
    title: "??????",
    titleKey: "Produce",
  },
  dispatch: {
    components: Dispatch,
    title: "??????",
    titleKey: "Dispatch",
  },
  unionBattle: {
    components: UnionBattle,
    title: "?????????",
    icon: true,
    toRoute: "unionBattleExplain",
    titleKey: "Guild_Wars",
  },
  hero: {
    components: Hero,
    title: "??????",
    titleKey: "Hero",
  },
  heroDetail: {
    components: HeroDetail,
    title: "????????????",
    titleKey: "hero_details",
  },
  battleFormation: {
    components: BattleFormation,
    title: "??????",
    titleKey: "hero_arrangement",
  },
  tavern: {
    components: Tavern,
    title: "??????",
    titleKey: "Tavern",
  },
  heroSynthesis: {
    components: HeroSynthesis,
    title: "??????",
    titleKey: "hero_synthesis",
  },
  heroLevelUp: {
    components: HeroLevelUp,
    title: "??????",
    titleKey: "hero_Hero_upgrade",
  },
  heroStarUp: {
    components: HeroStarUp,
    title: "??????",
    titleKey: "hero_Hero_rising_star",
  },
  invitation: {
    components: Invitation,
    title: "????????????",
    titleKey: "Invite",
  },
  cardMember: {
    components: CardMember,
    title: "??????",
    titleKey: "Member",
  },
  login: {
    components: Login,
    // title: "??????",
    // titleKey: 'Login'
  },
  unionBattleExplain: {
    components: UnionBattleExplain,
    title: "?????????",
    titleKey: "Guild_Wars",
  },
  resourceLoading: {
    components: ResourceLoading,
    title: "Loading",
  },
  warehouse: {
    components: Inventory,
    title: "??????",
    titleKey: "Depot",
  },

  cityDetails: {
    components: CityDetails,
    title: "?????????",
    titleKey: "Guild_Wars",
  },
};

export default routes;
