const Listing = require('../models/listing');
const User = require('../models/user');

// Get seller dashboard data (stats and recent listings)
exports.getDashboard = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // Get seller listings
    const listings = await Listing.find({ owner: sellerId, isDeleted: false });

    // Calculate stats
    const activeListings = listings.filter(l => l.status === 'available').length;
    const totalListings = listings.length;
    const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
    const totalSales = listings.filter(l => l.status === 'sold').length;
    
    // Calculate total revenue (sum of all sold items)
    const totalRevenue = listings
      .filter(l => l.status === 'sold')
      .reduce((sum, l) => sum + (l.price || 0), 0);

    // Get all listings for the dashboard, sorted by most recent
    const dashboardListings = listings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(l => ({
        id: l._id,
        title: l.title,
        price: l.price,
        views: l.views || 0,
        status: l.status,
        image: l.images?.[0] || null,
        createdAt: l.createdAt
      }));

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          activeListings,
          totalListings,
          totalViews,
          totalSales,
          totalRevenue
        },
        recentListings: dashboardListings // Keep key name for frontend compatibility
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all seller listings
exports.getListings = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { status, sort } = req.query;

    let query = { owner: sellerId, isDeleted: false };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    let listingsQuery = Listing.find(query);

    // Sort by createdAt (most recent first) by default
    if (sort === 'price-low') {
      listingsQuery = listingsQuery.sort({ price: 1 });
    } else if (sort === 'price-high') {
      listingsQuery = listingsQuery.sort({ price: -1 });
    } else if (sort === 'views') {
      listingsQuery = listingsQuery.sort({ views: -1 });
    } else {
      listingsQuery = listingsQuery.sort({ createdAt: -1 });
    }

    const listings = await listingsQuery;

    res.status(200).json({
      status: 'success',
      count: listings.length,
      data: {
        listings: listings.map(l => ({
          id: l._id,
          title: l.title,
          price: l.price,
          views: l.views || 0,
          status: l.status,
          image: l.images?.[0] || null,
          createdAt: l.createdAt,
          description: l.description
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get seller analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const listings = await Listing.find({ owner: sellerId, isDeleted: false });

    // Calculate various metrics
    const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
    const avgViews = listings.length > 0 ? Math.round(totalViews / listings.length) : 0;
    const listingsByStatus = {
      available: listings.filter(l => l.status === 'available').length,
      sold: listings.filter(l => l.status === 'sold').length,
    };

    const priceRange = {
      min: Math.min(...listings.map(l => l.price || 0)),
      max: Math.max(...listings.map(l => l.price || 0)),
      avg: listings.length > 0 
        ? Math.round(listings.reduce((sum, l) => sum + (l.price || 0), 0) / listings.length)
        : 0
    };

    res.status(200).json({
      status: 'success',
      data: {
        totalListings: listings.length,
        totalViews,
        avgViews,
        listingsByStatus,
        priceRange
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get seller sales data
exports.getSales = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const soldListings = await Listing.find({ 
      owner: sellerId, 
      status: 'sold',
      isDeleted: false
    }).sort({ updatedAt: -1 });

    const totalRevenue = soldListings.reduce((sum, l) => sum + (l.price || 0), 0);
    const totalSold = soldListings.length;

    res.status(200).json({
      status: 'success',
      data: {
        totalRevenue,
        totalSold,
        sales: soldListings.map(l => ({
          id: l._id,
          title: l.title,
          price: l.price,
          soldDate: l.updatedAt,
          image: l.images?.[0] || null
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};
