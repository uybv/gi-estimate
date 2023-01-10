import { Component, VERSION } from '@angular/core';
import {
  DmgService,
  Dmg,
  CharEntity,
  BuffEntity,
  OptimizerCondition,
  OptimizerResult,
} from './dmg.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.template.html',
})
export class AppComponent {
  public result: OptimizerResult[];

  constructor(private dmgSrv: DmgService) {
    //this.ayakaEstimate();
    //this.kleeEstimate();
    //this.yoiEstimate();
    this.yeaEstimate();
  }

  private yoiEstimate() {
    var atkBase = 899;
    var atkFlat = 311;
    var totalAtk = (46.6 / 100) * atkBase + atkBase + atkFlat;
    var dmgBonus = 46.6 + 28.8;
    var critRate = 5 + 33.1;
    var critDmg = 50 + 62.2;

    var char = new CharEntity(
      atkBase,
      totalAtk,
      252.0,
      dmgBonus,
      critRate,
      critDmg
    );
    char.ERecharge = 100;
    var buff = new BuffEntity(0, 35 + 8 * 2, 0, 0, 0);
    var condition = new OptimizerCondition();
    condition.MinEr = 100;
    condition.MinRate = 75;
    condition.Compare = 'Dmg';
    this.result = this.dmgSrv.Optimizer(char, buff, 31, condition, 1);
  }

  private kleeEstimate() {
    var atkBase = 899;
    var atkFlat = 311;
    var totalAtk = (46.6 / 100) * atkBase + atkBase + atkFlat;
    var dmgBonus = 46.6 + 28.8;
    var critRate = 5 + 33.1;
    var critDmg = 50 + 62.2;

    var char = new CharEntity(
      atkBase,
      totalAtk,
      252.0,
      dmgBonus,
      critRate,
      critDmg
    );
    char.ERecharge = 100;
    var buff = new BuffEntity(0, 35 + 8 * 2, 0, 0, 0);
    var condition = new OptimizerCondition();
    condition.MinEr = 100;
    condition.MinRate = 75;
    condition.Compare = 'Dmg';
    this.result = this.dmgSrv.Optimizer(char, buff, 31, condition, 1);
  }

  private ayakaEstimate() {
    //this.dmg = dmgSrv.GetDmg(1016, 2000, 202.1, 119.6, 45, 250);
    //console.log(JSON.stringify(this.dmg));
    var atkBase = 1016;
    var atkFlat = 311;
    var totalAtk = (46.6 / 100) * atkBase + atkBase + atkFlat;
    var dmgBonus = 15 + 46.6 + 12 + 28 + 18;
    var critRate = 5;
    var critDmg = 88.4 + 44.1 + 62.2;

    var char = new CharEntity(
      atkBase,
      totalAtk,
      202.1,
      dmgBonus,
      critRate,
      critDmg
    );
    char.ERecharge = 100;
    var buff = new BuffEntity(0, 0, 0, 55, 0);
    var condition = new OptimizerCondition();
    condition.MinEr = 100;
    //condition.MinRate = 45;
    condition.Compare = 'Dmg';
    this.result = this.dmgSrv.Optimizer(char, buff, 30, condition, 1);
  }

  private yeaEstimate() {
    //this.dmg = dmgSrv.GetDmg(1016, 2000, 202.1, 119.6, 45, 250);
    //console.log(JSON.stringify(this.dmg));
    var atkBase = 926;
    var atkFlat = 311;
    var totalAtk = ((46.6 + 18 + 18) / 100) * atkBase + atkBase + atkFlat;
    var dmgBonus = 46.6;
    var critRate = 24.2;
    var critDmg = 50 + 66.2 + 62.2;

    var char = new CharEntity(
      atkBase,
      totalAtk,
      151.7,
      dmgBonus,
      critRate,
      critDmg
    );
    char.ERecharge = 100;
    var buff = new BuffEntity(0, 0, 0, 0, 0);
    var condition = new OptimizerCondition();
    condition.MinEr = 135;
    condition.MinRate = 75;
    condition.Compare = 'Dmg';
    this.result = this.dmgSrv.Optimizer(char, buff, 30, condition, 1);
  }
}
