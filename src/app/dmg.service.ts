import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DmgService {
  constructor() {}

  private readonly CritUp: number = 6.61;
  private readonly RateUp: number = 3.31;
  private readonly ErUp: number = 5.51;
  private readonly AtkUp: number = 4.96;
  private readonly EmUp: number = 19.81;

  public GetDmg(
    atkBase: number,
    atkTotal: number,
    talent: number,
    damageBonus: number,
    critRate: number,
    critDamage: number
  ): Dmg {
    let char = new CharEntity(
      atkBase,
      atkTotal,
      talent,
      damageBonus,
      critRate,
      critDamage
    );
    let buff = new BuffEntity(0, 0, 0, 0, 0);
    let enemy = new EnemyEntity();
    return new Dmg(char, buff, enemy);
  }

  public Optimizer(
    char: CharEntity,
    buff: BuffEntity,
    upCount: number,
    condition: OptimizerCondition,
    countResult: number = 5
  ): OptimizerResult[] {
    let enemy = new EnemyEntity();

    let bestDmgs: OptimizerResult[] = [];
    for (var erCount = 0; erCount <= upCount; erCount++) {
      let er = char.ERecharge + erCount * this.ErUp;
      if (er < condition.MinEr) continue;

      for (var rateCount = 0; rateCount <= upCount - erCount; rateCount++) {
        let rate = char.CritRate + rateCount * this.RateUp;
        if (rate < condition.MinRate) continue;

        for (
          var atkCount = 0;
          atkCount <= upCount - erCount - rateCount;
          atkCount++
        ) {
          let atk =
            char.AtkTotal + ((atkCount * this.AtkUp) / 100) * char.AtkBase;

          for (
            var critCount = 0;
            critCount <= upCount - erCount - rateCount - atkCount;
            critCount++
          ) {
            let crit = char.CritDamage + critCount * this.CritUp;
            var newChar = new CharEntity(
              char.AtkBase,
              atk,
              char.Talent,
              char.DamageBonus,
              rate,
              crit
            );
            newChar.ERecharge = er;

            var rs = new OptimizerResult(newChar, buff, enemy);
            rs.AtkUpCount = atkCount;
            rs.CritRateUpCount = rateCount;
            rs.CritDamageUpCount = critCount;
            rs.EChargeUpCount = erCount;

            bestDmgs.push(rs);
          }
        }
      }
    }

    return bestDmgs
      .sort((a, b) =>
        (
          condition.Compare == 'Avg'
            ? a.Dmg.DmgAvg < b.Dmg.DmgAvg
            : a.Dmg.DmgCrit < b.Dmg.DmgCrit
        )
          ? 1
          : -1
      )
      .slice(0, countResult);
  }
}

export class CharEntity {
  public constructor(
    atkBase: number,
    atkTotal: number,
    talent: number,
    damageBonus: number,
    critRate: number,
    critDamage: number
  ) {
    this.AtkBase = atkBase;
    this.AtkTotal = atkTotal;
    this.Talent = talent;
    this.DamageBonus = damageBonus;
    this.CritRate = critRate;
    this.CritDamage = critDamage;
  }

  public Level: number = 90;
  public AtkBase: number;
  public AtkTotal: number;
  public Talent: number;
  public SpecialMultiplier: number = 1;
  public FlatDamage: number = 0;
  public DamageBonus: number;
  public CritRate: number;
  public CritDamage: number;

  public DefReduction: number = 0;
  public DefIgnore: number = 0;

  public ResistanceReduction: number = 0;

  public ERecharge: number = 100;
}

export class BuffEntity {
  public constructor(
    atk: number,
    dmgBonus: number,
    resistanceReduction: number,
    critRate: number,
    critDmg: number
  ) {
    this.Atk = atk;
    this.DamageBonus = dmgBonus;
    this.ResistanceReduction = resistanceReduction;
    this.CritRate = critRate;
    this.CritDamage = critDmg;
  }

  public FlatAtk: number = 0;
  public Atk: number = 0;
  public DamageBonus: number = 0;
  public FlatDamage: number = 0;

  public CritRate: number = 0;
  public CritDamage: number = 0;

  public DefReduction: number = 0;
  public DefIgnore: number = 0;

  public ResistanceReduction: number = 0;
}

export class EnemyEntity {
  public Level: number = 90;
  public BaseResistance: number = 10;
  public DamageReduction: number = 0;
}

export class Dmg {
  public readonly Char: CharEntity;
  public readonly Enemy: EnemyEntity;
  public readonly Buff: BuffEntity;

  constructor(char: CharEntity, buff: BuffEntity, enemy: EnemyEntity) {
    this.Char = char;
    this.Buff = buff;
    this.Enemy = enemy;
  }

  public get TotalAtk(): number {
    return (
      this.Char.AtkTotal +
      (this.Char.AtkBase * this.Buff.Atk) / 100 +
      this.Buff.FlatAtk
    );
  }

  public get TotalCritRate(): number {
    return this.Char.CritRate + this.Buff.CritRate;
  }

  public get TotalCritDamage(): number {
    return this.Char.CritDamage + this.Buff.CritDamage;
  }

  protected get BaseDamage(): number {
    return (this.TotalAtk * this.Char.Talent) / 100;
  }

  protected get FlatDamage(): number {
    return this.Char.FlatDamage + this.Buff.FlatDamage;
  }

  public get DamageBonus(): number {
    return (
      this.Char.DamageBonus + this.Buff.DamageBonus - this.Enemy.DamageReduction
    );
  }

  private get DmgCore(): number {
    return (
      (this.BaseDamage * this.Char.SpecialMultiplier + this.FlatDamage) *
      (1 + this.DamageBonus / 100) *
      this.EnemyDefMult *
      this.EnemyResMult *
      this.AmplifyingReaction
    );
  }

  public get DmgNonCrit(): number {
    return this.DmgCore + this.TransformativeReaction + this.Proc;
  }

  public get DmgCrit(): number {
    return (
      this.DmgCore * (1 + this.TotalCritDamage / 100) +
      this.TransformativeReaction +
      this.Proc
    );
  }

  public get DmgAvg(): number {
    var critRate = this.TotalCritRate > 100 ? 100 : this.TotalCritRate;
    return (
      (this.DmgCore * (1 + this.TotalCritDamage / 100) * critRate) / 100 +
      this.DmgCore * (1 - critRate / 100) +
      this.TransformativeReaction +
      this.Proc
    );
  }

  public get EnemyDefMult(): number {
    return (
      (this.Char.Level + 100) /
      (this.Char.Level +
        100 +
        (this.Enemy.Level + 100) *
          (1 - (this.Char.DefReduction + this.Buff.DefReduction) / 100) *
          (1 - (this.Char.DefIgnore + this.Buff.DefIgnore) / 100))
    );
  }

  private get Resistance(): number {
    return (
      this.Enemy.BaseResistance / 100 -
      (this.Char.ResistanceReduction + this.Buff.ResistanceReduction) / 100
    );
  }

  public get EnemyResMult(): number {
    let res = this.Resistance;
    if (res < 0) {
      return 1 - res / 2;
    } else if (res >= 0 && res < 0.75) {
      return 1 - res;
    } else {
      return 1 / (4 * res + 1);
    }
  }

  protected get AmplifyingReaction(): number {
    return 1;
  }

  protected get TransformativeReaction(): number {
    return 0;
  }

  protected get Proc(): number {
    return 0;
  }
}

export class WeakponEntity {
  public constructor(atkBase: number) {
    this.AtkBase = atkBase;
  }

  public AtkBase: number;
  public Atk: number;
  public CritRate: number;
  public CritDamage: number;
}

export class TdvEntity {
  public static readonly ATK: number = 46.6;
  public static readonly DMG_BONUS: number = 46.6;
  public static readonly CRIT_DAMAGE: number = 62.2;
  public static readonly CRIT_RATE: number = 31.1;

  public Item1: number = 4000;
  public Item2: number = 311;
  public Item3_Atk: number;
  public Item4_Atk: number;
  public Item4_DmgBonus: number;
  public Item5_Atk: number;
  public Item5_CritDamage: number;
  public Item5_CritRate: number;
}

export class CharOptimizerEntity {}

export class OptimizerCondition {
  public Compare: string = 'Avg';
  public MinEr: number = 100;
  public MinRate: number = 5;
  public MinCrit: number = 50;
}

export class OptimizerResult {
  public AtkUpCount: number = 0;
  public CritRateUpCount: number = 0;
  public CritDamageUpCount: number = 0;
  public EChargeUpCount: number = 0;

  private readonly _dmg: Dmg;

  public constructor(char: CharEntity, buff: BuffEntity, enemy: EnemyEntity) {
    this._dmg = new Dmg(char, buff, enemy);
  }

  public get Dmg(): Dmg {
    return this._dmg;
  }
}
