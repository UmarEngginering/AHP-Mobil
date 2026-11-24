"""
Flask Web Application for AHP Decision Support System
Sistem Pendukung Keputusan Pemilihan Mobil Terbaik Berdasarkan Metode AHP
"""

import os
import io
import csv
from flask import Flask, render_template, jsonify, request, send_file
from werkzeug.utils import secure_filename
import ahp_engine

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ahp-spk-secret-key-2026'
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# State cache untuk simulasi atau data yang sedang aktif
CURRENT_CUSTOM_DATA = None


@app.route('/')
def index():
    """Halaman utama dashboard AHP"""
    ahp_data = ahp_engine.run_full_ahp(CURRENT_CUSTOM_DATA)
    return render_template('index.html', data=ahp_data)


@app.route('/api/ahp-data', methods=['GET'])
def get_ahp_data():
    """Mengembalikan seluruh struktur data AHP dalam format JSON"""
    ahp_data = ahp_engine.run_full_ahp(CURRENT_CUSTOM_DATA)
    return jsonify({
        "success": True,
        "data": ahp_data
    })


@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    Simulasi sensitivitas / What-if Analysis:
    Menerima perubahan bobot kriteria langsung atau perubahan matriks perbandingan
    """
    req = request.get_json() or {}
    
    # Ambil data dasar
    base_data = ahp_engine.load_from_excel()
    
    # Mode 1: Simulasi langsung geser bobot kriteria (Sliders)
    if 'custom_weights' in req:
        custom_weights = req['custom_weights'] # [w_style, w_keandalan, w_bbm]
        # Normalisasi custom weights agar totalnya 1.0
        total_w = sum(custom_weights)
        if total_w > 0:
            norm_w = [w / total_w for w in custom_weights]
        else:
            norm_w = [1/3, 1/3, 1/3]
            
        # Hitung alternatif per kriteria
        style_calc = ahp_engine.calculate_ahp_matrix(base_data["alternative_names"], base_data["style_matrix"])
        keandalan_calc = ahp_engine.calculate_ahp_matrix(base_data["alternative_names"], base_data["keandalan_matrix"])
        bbm_calc = ahp_engine.calculate_ahp_matrix(base_data["alternative_names"], base_data["bbm_matrix"])
        
        alt_weights_by_criteria = [
            style_calc["weights"],
            keandalan_calc["weights"],
            bbm_calc["weights"]
        ]
        
        synthesis = ahp_engine.synthesize_scores(
            norm_w,
            alt_weights_by_criteria,
            base_data["alternative_names"],
            base_data["criteria_names"]
        )
        
        return jsonify({
            "success": True,
            "mode": "weight_simulation",
            "simulated_weights": norm_w,
            "synthesis": synthesis
        })
        
    # Mode 2: Simulasi dengan perbandingan matriks kriteria kustom
    if 'crit_matrix' in req:
        custom_crit_mat = req['crit_matrix']
        base_data['crit_matrix'] = custom_crit_mat
        
    if 'style_matrix' in req:
        base_data['style_matrix'] = req['style_matrix']
        
    if 'keandalan_matrix' in req:
        base_data['keandalan_matrix'] = req['keandalan_matrix']
        
    if 'bbm_matrix' in req:
        base_data['bbm_matrix'] = req['bbm_matrix']
        
    recomputed = ahp_engine.run_full_ahp(base_data)
    return jsonify({
        "success": True,
        "mode": "matrix_simulation",
        "data": recomputed
    })


@app.route('/api/reset', methods=['POST'])
def reset_data():
    """Reset data ke kondisi awal dari file Excel asli"""
    global CURRENT_CUSTOM_DATA
    CURRENT_CUSTOM_DATA = None
    data = ahp_engine.run_full_ahp()
    return jsonify({
        "success": True,
        "message": "Data berhasil direset ke nilai awal Excel.",
        "data": data
    })


@app.route('/api/upload-excel', methods=['POST'])
def upload_excel():
    """Upload file excel baru untuk diproses oleh engine AHP"""
    global CURRENT_CUSTOM_DATA
    if 'excel_file' not in request.files:
        return jsonify({"success": False, "error": "Tidak ada file yang diunggah"}), 400
        
    file = request.files['excel_file']
    if file.filename == '':
        return jsonify({"success": False, "error": "Nama file kosong"}), 400
        
    if file and file.filename.endswith(('.xlsx', '.xls')):
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        
        parsed = ahp_engine.load_from_excel(save_path)
        if parsed.get("excel_loaded", False):
            CURRENT_CUSTOM_DATA = parsed
            ahp_res = ahp_engine.run_full_ahp(CURRENT_CUSTOM_DATA)
            return jsonify({
                "success": True,
                "message": f"File {filename} berhasil dimuat dan diproses!",
                "data": ahp_res
            })
        else:
            return jsonify({
                "success": False,
                "error": "Format tabel di dalam file Excel tidak cocok dengan struktur AHP mobil"
            }), 400
            
    return jsonify({"success": False, "error": "Hanya file .xlsx yang diperbolehkan"}), 400


@app.route('/api/export-csv', methods=['GET'])
def export_csv():
    """Ekspor hasil perangkingan dan skor AHP dalam bentuk CSV"""
    ahp_data = ahp_engine.run_full_ahp(CURRENT_CUSTOM_DATA)
    synthesis = ahp_data['synthesis']
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["HASIL PERANGKINGAN SPK PEMILIHAN MOBIL (METODE AHP)"])
    writer.writerow([])
    writer.writerow(["Ranking", "Mobil", "Skor Akhir", "Persentase", "Kontribusi Style", "Kontribusi Keandalan", "Kontribusi BBM"])
    
    for item in synthesis['sorted_results']:
        b = item['breakdown']
        writer.writerow([
            item['rank'],
            item['name'],
            f"{item['score']:.6f}",
            f"{item['score_percent']:.2f}%",
            f"{b[0]['contribution']:.6f}",
            f"{b[1]['contribution']:.6f}",
            f"{b[2]['contribution']:.6f}"
        ])
        
    writer.writerow([])
    writer.writerow(["RINGKASAN UJI KONSISTENSI"])
    writer.writerow(["Matriks", "Lambda Max", "CI", "RI", "CR", "Status"])
    for c in ahp_data['consistency_summary']:
        writer.writerow([
            c['name'],
            f"{c['lambda_max']:.4f}",
            f"{c['ci']:.4f}",
            f"{c['ri']:.2f}",
            f"{c['cr']:.4f}",
            "KONSISTEN" if c['is_consistent'] else "TIDAK KONSISTEN"
        ])
        
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8-sig')),
        mimetype='text/csv',
        as_attachment=True,
        download_name='Hasil_AHP_Pemilihan_Mobil.csv'
    )


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    print("Menjalankan AHP Decision Support System Web App...")
    print(f"Buka browser di: http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=True)
