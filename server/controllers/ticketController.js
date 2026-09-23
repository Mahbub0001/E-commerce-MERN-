import Ticket from "../models/Ticket.js";

export async function getAllTickets(req, res, next) {
  try {
    const { status, priority, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (priority && priority !== "all") {
      filter.priority = priority;
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { ticketId: { $regex: q, $options: "i" } },
        { customerName: { $regex: q, $options: "i" } },
        { customerEmail: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { message: { $regex: q, $options: "i" } },
      ];
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Open", "In Progress", "Resolved"];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      res.status(404);
      throw new Error("Support ticket not found");
    }

    ticket.status = status;
    const updated = await ticket.save();

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteTicket(req, res, next) {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      res.status(404);
      throw new Error("Support ticket not found");
    }

    await Ticket.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
}
