// Generated by CoffeeScript 2.7.0
var simple_ga;

simple_ga = class simple_ga {
  constructor(metric) {
    this.n = metric.length;
    this.metric = metric;
    this.blade_count = 2 ** this.n;
  }

  blade_id(grade) {
    return 1 << grade;
  }

  basis(grade) {
    return [[1 << grade], [1]];
  }

  grade(a) {
    var n;
    // blade_id -> integer
    // determine grade by counting the number of set bits.
    n = 0;
    while (a !== 0) {
      a &= a - 1;
      n += 1;
    }
    return n;
  }

  antisymmetric_sign(a, b) {
    var count, k, l, ref;
    // blade_id blade_id -> integer
    count = 0;
    for (k = l = 0, ref = this.n; (0 <= ref ? l < ref : l > ref); k = 0 <= ref ? ++l : --l) {
      if ((a >> k) & 1) {
        count += this.grade(b & ((1 << k) - 1));
      }
    }
    if ((count & 1) === 0) {
      return 1;
    } else {
      return -1;
    }
  }

  metric_sign(a, b) {
    var common_bases, i, sign;
    // blade_id blade_id -> integer
    common_bases = a & b;
    sign = 1;
    i = 0;
    while (common_bases !== 0) {
      if (common_bases & 1) {
        sign *= this.metric[i];
      }
      common_bases >>= 1;
      i += 1;
    }
    return sign;
  }

  gp(a, b) {
    var a_coeffs, a_ids, ai, b_coeffs, b_ids, bj, blade_id, coeff, i, i_a, i_b, j, l, m, ref, ref1, res_coeff, result, result_coeffs, result_ids, sign;
    // multivector multivector -> multivector
    result = {};
    [a_ids, a_coeffs] = a;
    [b_ids, b_coeffs] = b;
    for (i_a = l = 0, ref = a_ids.length; (0 <= ref ? l < ref : l > ref); i_a = 0 <= ref ? ++l : --l) {
      i = a_ids[i_a];
      ai = a_coeffs[i_a];
      for (i_b = m = 0, ref1 = b_ids.length; (0 <= ref1 ? m < ref1 : m > ref1); i_b = 0 <= ref1 ? ++m : --m) {
        j = b_ids[i_b];
        bj = b_coeffs[i_b];
        blade_id = i ^ j;
        sign = this.antisymmetric_sign(i, j) * this.metric_sign(i, j);
        res_coeff = sign * ai * bj;
        result[blade_id] = (result[blade_id] || 0) + res_coeff;
      }
    }
    result_ids = [];
    result_coeffs = [];
    for (blade_id in result) {
      coeff = result[blade_id];
      if (!(coeff !== 0)) {
        continue;
      }
      result_ids.push(parseInt(blade_id));
      result_coeffs.push(coeff);
    }
    return [result_ids, result_coeffs];
  }

  // Shared primitive function for grade-dependent sign
  apply_grade_sign(a, sign_function) {
    var blade, coeff, coeffs, grade, i, ids, l, new_coeffs, new_ids, ref, sign;
    // multivector function -> multivector
    [ids, coeffs] = a;
    new_ids = ids.slice(0);
    new_coeffs = [];
    for (i = l = 0, ref = ids.length; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
      blade = ids[i];
      coeff = coeffs[i];
      grade = this.grade(blade);
      sign = sign_function(grade);
      new_coeffs[i] = coeff * sign;
    }
    return [new_ids, new_coeffs];
  }

  reverse(a) {
    var sign_function;
    // multivector -> multivector
    // reverse the order of basis vectors in each blade.
    // each blade's coefficient is multiplied by (-1 ** (k * (k - 1) / 2)), where k is the grade.
    sign_function = function(grade) {
      var exponent;
      exponent = (grade * (grade - 1)) >> 1; // Integer division by 2
      return (-1) ** exponent;
    };
    return this.apply_grade_sign(a, sign_function);
  }

  involute(a) {
    var sign_function;
    // multivector -> multivector
    // changes the sign of blades based on their grade.
    // each blades coefficient is multiplied by (-1) ** k
    sign_function = function(grade) {
      return (-1) ** grade;
    };
    return this.apply_grade_sign(a, sign_function);
  }

  conjugate(a) {
    var sign_function;
    // multivector -> multivector
    // combines the reverse and involute operations.
    // each blades coefficient is multiplied by (-1) ** (k * (k + 1) / 2)
    sign_function = function(grade) {
      var exponent;
      exponent = (grade * (grade + 1)) >> 1;
      return (-1) ** exponent;
    };
    return this.apply_grade_sign(a, sign_function);
  }

  combine(a, b, scalar = 1) {
    var a_coeffs, a_ids, b_coeffs, b_ids, blade_id, coeff, i, l, m, ref, ref1, result, result_coeffs, result_ids;
    // multivector multivector number -> multivector
    result = {};
    [a_ids, a_coeffs] = a;
    [b_ids, b_coeffs] = b;
// add coefficients from a
    for (i = l = 0, ref = a_ids.length; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
      blade_id = a_ids[i];
      coeff = a_coeffs[i];
      result[blade_id] = coeff;
    }
// combine coefficients from b with scalar multiplier
    for (i = m = 0, ref1 = b_ids.length; (0 <= ref1 ? m < ref1 : m > ref1); i = 0 <= ref1 ? ++m : --m) {
      blade_id = b_ids[i];
      coeff = scalar * b_coeffs[i];
      if (blade_id in result) {
        result[blade_id] += coeff;
      } else {
        result[blade_id] = coeff;
      }
    }
    result_ids = [];
    result_coeffs = [];
    for (blade_id in result) {
      coeff = result[blade_id];
      if (!(coeff !== 0)) {
        continue;
      }
      result_ids.push(parseInt(blade_id));
      result_coeffs.push(coeff);
    }
    return [result_ids, result_coeffs];
  }

  add(a, b) {
    return this.combine(a, b, 1);
  }

  subtract(a, b) {
    return this.combine(a, b, -1);
  }

  ip(a, b) {
    var a_coeffs, a_ids, ai, b_coeffs, b_ids, bj, blade_id, coeff, grade_a, grade_b, grade_res, i, i_a, i_b, j, l, m, ref, ref1, res_coeff, result, result_coeffs, result_ids, sign;
    // multivector multivector -> multivector
    result = {};
    [a_ids, a_coeffs] = a;
    [b_ids, b_coeffs] = b;
    for (i_a = l = 0, ref = a_ids.length; (0 <= ref ? l < ref : l > ref); i_a = 0 <= ref ? ++l : --l) {
      i = a_ids[i_a];
      ai = a_coeffs[i_a];
      grade_a = this.grade(i);
      for (i_b = m = 0, ref1 = b_ids.length; (0 <= ref1 ? m < ref1 : m > ref1); i_b = 0 <= ref1 ? ++m : --m) {
        j = b_ids[i_b];
        bj = b_coeffs[i_b];
        grade_b = this.grade(j);
        if (grade_a <= grade_b) {
          blade_id = i ^ j;
          grade_res = grade_b - grade_a;
          if (this.grade(blade_id) === grade_res) {
            sign = this.antisymmetric_sign(i, j) * this.metric_sign(i, j);
            res_coeff = sign * ai * bj;
            result[blade_id] = (result[blade_id] || 0) + res_coeff;
          }
        }
      }
    }
    result_ids = [];
    result_coeffs = [];
    for (blade_id in result) {
      coeff = result[blade_id];
      if (!(coeff !== 0)) {
        continue;
      }
      result_ids.push(parseInt(blade_id));
      result_coeffs.push(coeff);
    }
    return [result_ids, result_coeffs];
  }

  ep(a, b) {
    var a_coeffs, a_ids, ai, b_coeffs, b_ids, bj, blade_id, coeff, grade_a, grade_b, grade_res, i, i_a, i_b, j, l, m, ref, ref1, res_coeff, result, result_coeffs, result_ids, sign;
    // multivector multivector -> multivector
    result = {};
    [a_ids, a_coeffs] = a;
    [b_ids, b_coeffs] = b;
    for (i_a = l = 0, ref = a_ids.length; (0 <= ref ? l < ref : l > ref); i_a = 0 <= ref ? ++l : --l) {
      i = a_ids[i_a];
      ai = a_coeffs[i_a];
      grade_a = this.grade(i);
      for (i_b = m = 0, ref1 = b_ids.length; (0 <= ref1 ? m < ref1 : m > ref1); i_b = 0 <= ref1 ? ++m : --m) {
        j = b_ids[i_b];
        bj = b_coeffs[i_b];
        grade_b = this.grade(j);
        blade_id = i ^ j;
        grade_res = grade_a + grade_b;
        if (this.grade(blade_id) === grade_res) {
          sign = this.antisymmetric_sign(i, j) * this.metric_sign(i, j);
          res_coeff = sign * ai * bj;
          result[blade_id] = (result[blade_id] || 0) + res_coeff;
        }
      }
    }
    result_ids = [];
    result_coeffs = [];
    for (blade_id in result) {
      coeff = result[blade_id];
      if (!(coeff !== 0)) {
        continue;
      }
      result_ids.push(parseInt(blade_id));
      result_coeffs.push(coeff);
    }
    return [result_ids, result_coeffs];
  }

  inverse(a) {
    var a_inverse, a_reverse, coeffs, denom, denom_mv, i, ids, l, m, ref, ref1;
    // multivector -> multivector
    a_reverse = this.reverse(a);
    denom_mv = this.gp(a, a_reverse);
    denom = 0;
    [ids, coeffs] = denom_mv;
    for (i = l = 0, ref = ids.length; (0 <= ref ? l < ref : l > ref); i = 0 <= ref ? ++l : --l) {
      if (ids[i] === 0) { // scalar part has blade_id 0
        denom = coeffs[i];
        break;
      }
    }
    if (denom === 0) {
      throw new Error("multivector is not invertible (denominator is zero).");
    }
    // compute inverse: a_inverse = a_reverse / denom
    a_inverse = [a_reverse[0], []];
    for (i = m = 0, ref1 = a_reverse[1].length; (0 <= ref1 ? m < ref1 : m > ref1); i = 0 <= ref1 ? ++m : --m) {
      a_inverse[1][i] = a_reverse[1][i] / denom;
    }
    return a_inverse;
  }

  sp(a, b) {
    var a_inverse, temp;
    // multivector multivector -> multivector
    // compute the sandwich product: a * b * a ** -1
    a_inverse = this.inverse(a);
    temp = this.gp(a, b);
    return this.gp(temp, a_inverse);
  }

  pseudoscalar() {
    var i, l, ps, ref;
    // -> multivector
    ps = this.basis(0);
    for (i = l = 1, ref = this.n; (1 <= ref ? l < ref : l > ref); i = 1 <= ref ? ++l : --l) {
      ps = this.ep(ps, this.basis(i));
    }
    return ps;
  }

};
