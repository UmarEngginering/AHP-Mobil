"""
AHP Computational Engine
Mengimplementasikan metode Analytic Hierarchy Process (AHP) sesuai formulasi Thomas L. Saaty
dan memuat data langsung dari AHP_Studi_Kasus_Mobil.xlsx
"""

import os
import openpyxl

# Tabel Random Index (RI) standar Saaty
SAATY_RI = {
    1: 0.00,
    2: 0.00,
    3: 0.58,
    4: 0.90,
    5: 1.12,
    6: 1.24,
    7: 1.32,
    8: 1.41,
    9: 1.45,
    10: 1.49,
    11: 1.51,
    12: 1.48,
    13: 1.56,
    14: 1.57,
    15: 1.59
}

# Skala perbandingan Saaty 1-9
SAATY_SCALE = [
    {"value": 1, "description": "Sama penting (Equal Importance)"},
    {"value": 2, "description": "Mendekati sedikit lebih penting (Intermediate)"},
    {"value": 3, "description": "Sedikit lebih penting (Moderate Importance)"},
    {"value": 4, "description": "Mendekati lebih penting (Intermediate)"},
    {"value": 5, "description": "Lebih penting (Strong Importance)"},
    {"value": 6, "description": "Mendekati sangat penting (Intermediate)"},
    {"value": 7, "description": "Sangat penting (Very Strong / Demonstrated)"},
    {"value": 8, "description": "Mendekati mutlak lebih penting (Intermediate)"},
    {"value": 9, "description": "Mutlak lebih penting (Extreme Importance)"}
]


def calculate_ahp_matrix(labels, matrix):
    """
    Menghitung matriks AHP:
    - Normalisasi
    - Vektor Bobot Prioritas (Eigen Vector)
    - Eigen Value (Lambda Max)
    - Consistency Index (CI)
    - Random Index (RI)
    - Consistency Ratio (CR)
    """
    n = len(matrix)
    
    # 1. Jumlah Kolom (Column Sums)
    col_sums = [sum(matrix[r][c] for r in range(n)) for c in range(n)]
    
    # 2. Matriks Normalisasi
    norm_matrix = []
    for r in range(n):
        norm_row = []
        for c in range(n):
            denom = col_sums[c] if col_sums[c] != 0 else 1.0
            norm_row.append(matrix[r][c] / denom)
        norm_matrix.append(norm_row)
        
    # 3. Vektor Bobot / Rata-rata Baris
    weights = [sum(norm_matrix[r]) / n for r in range(n)]
    
    # 4. Eigen Values & Lambda Max (sesuai rumus Excel: Total Kolom_i * Bobot_i)
    eigen_values = [col_sums[i] * weights[i] for i in range(n)]
    lambda_max = sum(eigen_values)
    
    # 5. Consistency Index (CI)
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0
    
    # 6. Random Index (RI)
    ri = SAATY_RI.get(n, 1.49)
    
    # 7. Consistency Ratio (CR)
    cr = ci / ri if ri > 0 else 0.0
    is_consistent = cr <= 0.10001
    
    return {
        "labels": labels,
        "n": n,
        "raw_matrix": matrix,
        "col_sums": col_sums,
        "norm_matrix": norm_matrix,
        "weights": weights,
        "eigen_values": eigen_values,
        "lambda_max": lambda_max,
        "ci": ci,
        "ri": ri,
        "cr": cr,
        "cr_percent": cr * 100,
        "is_consistent": is_consistent
    }


def synthesize_scores(criteria_weights, alt_weights_by_criteria, alternative_names, criteria_names):
    """
    Menghitung skor akhir dan perankingan alternatif:
    Skor Alternatif i = SUM(Bobot Kriteria j * Bobot Alternatif i pada Kriteria j)
    """
    num_alts = len(alternative_names)
    num_crit = len(criteria_names)
    
    breakdown_matrix = []
    scores = []
    
    for alt_idx in range(num_alts):
        row_breakdown = []
        total_score = 0.0
        for crit_idx in range(num_crit):
            alt_crit_weight = alt_weights_by_criteria[crit_idx][alt_idx]
            crit_weight = criteria_weights[crit_idx]
            contrib = alt_crit_weight * crit_weight
            row_breakdown.append({
                "criteria": criteria_names[crit_idx],
                "alt_weight": alt_crit_weight,
                "crit_weight": crit_weight,
                "contribution": contrib
            })
            total_score += contrib
        breakdown_matrix.append(row_breakdown)
        scores.append(total_score)
        
    # Hitung ranking (1 = skor tertinggi)
    ranked_indices = sorted(range(num_alts), key=lambda i: scores[i], reverse=True)
    
    rank_map = {}
    for rank, idx in enumerate(ranked_indices, start=1):
        rank_map[idx] = rank
        
    results = []
    for idx, name in enumerate(alternative_names):
        results.append({
            "index": idx,
            "name": name,
            "score": scores[idx],
            "score_percent": scores[idx] * 100,
            "rank": rank_map[idx],
            "breakdown": breakdown_matrix[idx]
        })
        
    # Sort results by rank for convenience
    sorted_results = sorted(results, key=lambda x: x["rank"])
    winner = sorted_results[0] if sorted_results else None
    
    return {
        "results": results,
        "sorted_results": sorted_results,
        "winner": winner
    }


def load_from_excel(filepath=None):
    """
    Membaca data matriks AHP dari file Excel studi kasus mobil.
    Jika file tidak ditemukan atau terkunci, gunakan dataset default yang identik.
    """
    if filepath is None:
        filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "AHP_Studi_Kasus_Mobil.xlsx")
        
    criteria_names = ["Style (Gaya)", "Keandalan", "Konsumsi BBM"]
    criteria_codes = ["S", "K", "B"]
    alternative_names = ["Avanza", "Xenia", "Ertiga", "Grand Livina"]
    
    # Nilai default sesuai AHP_Studi_Kasus_Mobil.xlsx
    crit_matrix = [
        [1.0, 0.5, 3.0],
        [2.0, 1.0, 4.0],
        [1.0 / 3.0, 0.25, 1.0]
    ]
    
    style_matrix = [
        [1.0, 2.0, 1.0 / 3.0, 0.25],
        [0.5, 1.0, 0.25, 0.20],
        [3.0, 4.0, 1.0, 2.0],
        [4.0, 5.0, 0.5, 1.0]
    ]
    
    keandalan_matrix = [
        [1.0, 2.0, 0.25, 1.0 / 3.0],
        [0.5, 1.0, 0.20, 0.25],
        [4.0, 5.0, 1.0, 3.0],
        [3.0, 4.0, 1.0 / 3.0, 1.0]
    ]
    
    bbm_matrix = [
        [1.0, 2.0, 0.5, 4.0],
        [0.5, 1.0, 2.0 / 3.0, 3.0],
        [2.0, 1.5, 1.0, 4.0],
        [0.25, 1.0 / 3.0, 0.25, 1.0]
    ]
    
    excel_loaded = False
    
    if os.path.exists(filepath):
        try:
            wb = openpyxl.load_workbook(filepath, data_only=True)
            sheet = wb.active
            
            # Helper to read submatrix
            def read_sub(start_r, size):
                m = []
                for r in range(start_r, start_r + size):
                    row = [float(sheet.cell(r, c).value) for c in range(2, 2 + size)]
                    m.append(row)
                return m

            crit_matrix = read_sub(18, 3)
            style_matrix = read_sub(33, 4)
            keandalan_matrix = read_sub(50, 4)
            bbm_matrix = read_sub(67, 4)
            excel_loaded = True
        except Exception as e:
            print(f"Pemberitahuan: Membaca file excel dengan fallback default ({e})")
            excel_loaded = False
            
    return {
        "excel_loaded": excel_loaded,
        "criteria_names": criteria_names,
        "criteria_codes": criteria_codes,
        "alternative_names": alternative_names,
        "crit_matrix": crit_matrix,
        "style_matrix": style_matrix,
        "keandalan_matrix": keandalan_matrix,
        "bbm_matrix": bbm_matrix
    }


def run_full_ahp(custom_data=None):
    """
    Menjalankan seluruh pipa perhitungan AHP dan mengembalikan data lengkap terstruktur
    untuk visualisasi web.
    """
    data = custom_data if custom_data else load_from_excel()
    
    crit_calc = calculate_ahp_matrix(data["criteria_codes"], data["crit_matrix"])
    style_calc = calculate_ahp_matrix(data["alternative_names"], data["style_matrix"])
    keandalan_calc = calculate_ahp_matrix(data["alternative_names"], data["keandalan_matrix"])
    bbm_calc = calculate_ahp_matrix(data["alternative_names"], data["bbm_matrix"])
    
    alt_weights_by_criteria = [
        style_calc["weights"],
        keandalan_calc["weights"],
        bbm_calc["weights"]
    ]
    
    synthesis = synthesize_scores(
        crit_calc["weights"],
        alt_weights_by_criteria,
        data["alternative_names"],
        data["criteria_names"]
    )
    
    consistency_summary = [
        {
            "name": "Kriteria Utama (S, K, B)",
            "lambda_max": crit_calc["lambda_max"],
            "ci": crit_calc["ci"],
            "ri": crit_calc["ri"],
            "cr": crit_calc["cr"],
            "cr_percent": crit_calc["cr_percent"],
            "is_consistent": crit_calc["is_consistent"]
        },
        {
            "name": "Alternatif pada Kriteria Style",
            "lambda_max": style_calc["lambda_max"],
            "ci": style_calc["ci"],
            "ri": style_calc["ri"],
            "cr": style_calc["cr"],
            "cr_percent": style_calc["cr_percent"],
            "is_consistent": style_calc["is_consistent"]
        },
        {
            "name": "Alternatif pada Kriteria Keandalan",
            "lambda_max": keandalan_calc["lambda_max"],
            "ci": keandalan_calc["ci"],
            "ri": keandalan_calc["ri"],
            "cr": keandalan_calc["cr"],
            "cr_percent": keandalan_calc["cr_percent"],
            "is_consistent": keandalan_calc["is_consistent"]
        },
        {
            "name": "Alternatif pada Kriteria Konsumsi BBM",
            "lambda_max": bbm_calc["lambda_max"],
            "ci": bbm_calc["ci"],
            "ri": bbm_calc["ri"],
            "cr": bbm_calc["cr"],
            "cr_percent": bbm_calc["cr_percent"],
            "is_consistent": bbm_calc["is_consistent"]
        }
    ]
    
    all_consistent = all(item["is_consistent"] for item in consistency_summary)
    
    return {
        "metadata": {
            "title": "Sistem Pendukung Keputusan Pemilihan Mobil Terbaik",
            "method": "Analytic Hierarchy Process (AHP)",
            "goal": "Memilih Mobil Terbaik dari 4 Alternatif Berdasarkan 3 Kriteria",
            "excel_loaded": data.get("excel_loaded", False),
            "all_consistent": all_consistent
        },
        "criteria_names": data["criteria_names"],
        "criteria_codes": data["criteria_codes"],
        "alternative_names": data["alternative_names"],
        "saaty_scale": SAATY_SCALE,
        "saaty_ri": SAATY_RI,
        "criteria": crit_calc,
        "style": style_calc,
        "keandalan": keandalan_calc,
        "bbm": bbm_calc,
        "synthesis": synthesis,
        "consistency_summary": consistency_summary
    }


if __name__ == "__main__":
    res = run_full_ahp()
    print("Winner:", res["synthesis"]["winner"]["name"], "Score:", res["synthesis"]["winner"]["score"])
    for r in res["synthesis"]["sorted_results"]:
        print(f"Rank {r['rank']}: {r['name']} - {r['score_percent']:.2f}%")
