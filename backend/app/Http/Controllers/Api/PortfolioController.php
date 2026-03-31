<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    /**
     * Listar portafolios del usuario autenticado.
     */
    public function index(Request $request)
    {
        $portfolios = $request->user()
            ->portfolios()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($portfolios);
    }

    /**
     * Crear un nuevo portafolio.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'theme' => 'nullable|string',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
        ]);

        $portfolio = $request->user()->portfolios()->create($validated);

        return response()->json([
            'message' => 'Portafolio creado exitosamente',
            'portfolio' => $portfolio,
        ], 201);
    }

    /**
     * Obtener un portafolio específico.
     */
    public function show(Portfolio $portfolio)
    {
        $portfolio->load('projects');
        return response()->json($portfolio);
    }

    /**
     * Actualizar un portafolio.
     */
    public function update(Request $request, Portfolio $portfolio)
    {
        $this->authorize('update', $portfolio);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'theme' => 'nullable|string',
            'is_published' => 'sometimes|boolean',
            'custom_domain' => 'nullable|string',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string',
        ]);

        $portfolio->update($validated);

        return response()->json([
            'message' => 'Portafolio actualizado exitosamente',
            'portfolio' => $portfolio,
        ]);
    }

    /**
     * Eliminar un portafolio.
     */
    public function destroy(Request $request, Portfolio $portfolio)
    {
        $this->authorize('delete', $portfolio);

        $portfolio->delete();

        return response()->json([
            'message' => 'Portafolio eliminado exitosamente',
        ]);
    }

    /**
     * Obtener portafolio público por slug.
     */
    public function publicPortfolio($slug)
    {
        $portfolio = Portfolio::where('slug', $slug)
            ->where('is_published', true)
            ->with(['projects', 'user'])
            ->firstOrFail();

        return response()->json($portfolio);
    }
}
