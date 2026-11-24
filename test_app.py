"""
Unit and integration test for Flask AHP application
"""

import unittest
from app import app
import json

class AhpWebAppTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_index_page(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        html = response.data.decode('utf-8')
        self.assertIn("AHP Car Decision", html)
        self.assertIn("Ertiga", html)
        self.assertIn("Grand Livina", html)
        self.assertIn("Avanza", html)
        self.assertIn("Xenia", html)
        self.assertIn("Konsisten", html)
        print("✓ Index page loaded successfully with expected content.")

    def test_api_ahp_data(self):
        response = self.app.get('/api/ahp-data')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(data['success'])
        winner = data['data']['synthesis']['winner']
        self.assertEqual(winner['name'], "Ertiga")
        self.assertAlmostEqual(winner['score'], 0.4814, places=3)
        print(f"✓ API /api/ahp-data returned winner: {winner['name']} with score {winner['score']:.4f}")

    def test_api_simulate_weights(self):
        # Simulation with custom weights: e.g. Style=10%, Keandalan=80%, BBM=10%
        payload = {"custom_weights": [0.1, 0.8, 0.1]}
        response = self.app.post('/api/simulate', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        res_data = json.loads(response.data.decode('utf-8'))
        self.assertTrue(res_data['success'])
        self.assertEqual(res_data['mode'], 'weight_simulation')
        winner = res_data['synthesis']['winner']
        print(f"✓ Simulation test passed. Winner under Keandalan 80%: {winner['name']} ({winner['score']:.4f})")

    def test_api_export_csv(self):
        response = self.app.get('/api/export-csv')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'HASIL PERANGKINGAN SPK PEMILIHAN MOBIL', response.data)
        self.assertIn(b'Ertiga', response.data)
        print("✓ CSV Export endpoint verified successfully.")

if __name__ == '__main__':
    unittest.main()
